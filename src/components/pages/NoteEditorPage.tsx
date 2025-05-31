import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useNoteContext } from '@/context/NoteContext';
import { useTaskContext } from '@/context/TaskContext';
import NoteForm from '@/components/forms/NoteForm';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { Note } from '@/types/note';
import { Task } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { NoteService } from '@/services/NoteService';

// Define LocationState for typing navigation state
type LocationState = {
    from?: string;
};

const NoteEditorPage: React.FC = () => {
    const location = useLocation();
    const { noteId, taskId } = useParams<{
        noteId?: string;
        taskId?: string;
    }>();
    const navigate = useNavigate();
    const {
        getNoteById,
        addNote,
        updateNote,
        deleteNote,
        loading: noteLoading,
    } = useNoteContext();
    const { tasks, loading: tasksLoading } = useTaskContext(); // tasks is an array

    const [currentNote, setCurrentNote] = useState<Note | undefined>(undefined);
    const [initialTaskForNote, setInitialTaskForNote] = useState<
        Task | undefined
    >(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false); // <-- New state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const isEditing = !!noteId;

    // Helper function for consistent back navigation
    const determineAndNavigateBack = () => {
        const fromPath = location.state?.from;

        if (fromPath) {
            navigate(fromPath);
        } else if (taskId) {
            // Navigating back from a note associated with a task
            const targetPath = `/tasks/${taskId}`;
            navigate(targetPath);
        } else if (isEditing && noteId) {
            // Navigating back from editing a note (no specific task context)
            const targetPath = '/notes';
            navigate(targetPath);
        } else {
            // Default fallback (e.g., new note without task, or other unexpected scenarios)
            navigate('/');
        }
    };

    useEffect(() => {
        const abortController = new AbortController();

        const performFetch = async () => {
            setIsLoading(true);
            setDataReady(false); // <-- Reset dataReady

            let noteToSet: Note | undefined = undefined;
            let taskToSet: Task | undefined = undefined;
            let shouldNavigate = false;
            let navigatePath = '';
            let navigationState: LocationState | undefined = undefined;

            try {
                if (isEditing && noteId) {
                    let noteFromContext = await getNoteById(noteId); // from context
                    if (abortController.signal.aborted)
                        throw new Error('aborted');

                    if (noteFromContext) {
                        noteToSet = noteFromContext;
                    } else {
                        const noteFromService = await NoteService.getNoteById(
                            noteId
                        ); // from service
                        if (abortController.signal.aborted)
                            throw new Error('aborted');

                        if (noteFromService) {
                            noteToSet = noteFromService;
                        } else {
                            shouldNavigate = true;
                            navigatePath = taskId
                                ? `/tasks/${taskId}`
                                : '/notes';
                            navigationState = location.state?.from
                                ? { from: location.state.from }
                                : undefined;
                            toast({
                                title: 'Note Not Found',
                                description: `The requested note (ID: ${noteId}) could not be found.`,
                                variant: 'destructive',
                            });
                        }
                    }
                } else if (!isEditing && taskId) {
                    const task = tasks.find((t) => t.id === taskId);
                    if (task) {
                        taskToSet = task;
                        // NoteForm will handle new note state, currentNote remains undefined initially for new notes.
                    } else {
                        shouldNavigate = true;
                        navigatePath = '/tasks';
                        toast({
                            title: 'Task Not Found',
                            description: `The task (ID: ${taskId}) to associate with the new note was not found.`,
                            variant: 'destructive',
                        });
                    }
                } else {
                    // currentNote and initialTaskForNote remain undefined for a brand new, unassociated note.
                }

                // If a note was loaded (either editing or a template for a new task-associated note)
                // and it has tagged tasks, try to find the primary task for display context.
                if (
                    noteToSet &&
                    noteToSet.taggedTaskIds &&
                    noteToSet.taggedTaskIds.length > 0 &&
                    !taskToSet
                ) {
                    const primaryTaskIdForNote = noteToSet.taggedTaskIds[0];

                    const associatedTask = tasks.find(
                        (t) => t.id === primaryTaskIdForNote
                    );
                    if (associatedTask) {
                        taskToSet = associatedTask;
                    }
                }

                // Crucially, set state *before* setting isLoading to false if not navigating
                if (!shouldNavigate) {
                    setCurrentNote(noteToSet);
                    setInitialTaskForNote(taskToSet);
                    setDataReady(true); // <-- Set dataReady to true
                } else {
                }
            } catch (error: any) {
                if (
                    abortController.signal.aborted &&
                    error.message === 'aborted'
                ) {
                    return; // Stop processing if aborted
                }
                console.error(
                    '[NoteEditorPage performFetch] Error fetching note data:',
                    error
                );
                toast({
                    title: 'Error',
                    description: 'Failed to load note data.',
                    variant: 'destructive',
                });
                // Consider navigating on error: shouldNavigate = true; navigatePath = '/error';
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);

                    if (shouldNavigate) {
                        navigate(navigatePath, {
                            replace: true,
                            state: navigationState,
                        });
                    }
                }
            }
        };

        if (!tasksLoading) {
            performFetch();
        } else {
            // If tasks are loading, we should reflect this in the page's loading state
            // because initialTaskForNote depends on tasks. The main loading check already covers tasksLoading.
            // However, if we don't run performFetch, local isLoading might not be managed correctly.
            // For now, the outer `if (isLoading || noteLoading || (taskId && tasksLoading))` handles this.
            // If tasksLoading is true, it will show loading. If it becomes false, this effect re-runs.
        }

        return () => {
            abortController.abort();
        };
    }, [
        noteId,
        taskId,
        tasksLoading,
        getNoteById,
        tasks,
        navigate,
        isEditing,
        location.state,
    ]); // Added isEditing and location.state

    const handleSaveNote = async (
        noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & {
            taggedTaskIds?: string[];
        }
    ) => {
        if (!addNote || !updateNote) {
            toast({
                title: 'Error',
                description: 'Note context not available.',
                variant: 'destructive',
            });
            return;
        }

        const notePayload: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & {
            id?: string;
        } = {
            ...noteData,
            name:
                noteData.name.trim() ||
                (isEditing && currentNote?.name
                    ? currentNote.name
                    : 'Untitled Note'),
            body: noteData.body,
            taggedTaskIds: noteData.taggedTaskIds || [],
        };

        try {
            let savedNote: Note | null = null;
            if (isEditing && noteId) {
                // Ensure currentNote is spread first, then payload, then ensure id is from noteId (from params)
                const noteToUpdate = {
                    ...currentNote,
                    ...notePayload,
                    id: noteId,
                } as Note;
                savedNote = await updateNote(noteToUpdate);
            } else {
                // addNote expects Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, which notePayload is.
                savedNote = await addNote(
                    notePayload as Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
                );
            }

            if (savedNote) {
                toast({
                    title: `Note ${isEditing ? 'Updated' : 'Created'}`,
                    description: `Note "${
                        savedNote.name
                    }" has been successfully ${
                        isEditing ? 'updated' : 'created'
                    }.`,
                });

                determineAndNavigateBack();
            } else {
                toast({
                    title: 'Error',
                    description: `Failed to ${
                        isEditing ? 'update' : 'create'
                    } note.`,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error(
                '[NoteEditorPage handleSaveNote] Error saving note:',
                error
            );
            toast({
                title: 'Error',
                description: `An error occurred while saving the note.`,
                variant: 'destructive',
            });
        }
    };

    const handleCancel = () => {
        determineAndNavigateBack();
    };

    const handleDeleteConfirm = async () => {
        if (!noteId) return;
        try {
            await deleteNote(noteId);
            toast({
                title: 'Note Deleted',
                description: 'The note has been successfully deleted.',
            });
            setIsDeleteDialogOpen(false);
            determineAndNavigateBack(); // Navigate away after deletion
        } catch (error) {
            console.error(
                '[NoteEditorPage handleDeleteConfirm] Error deleting note:',
                error
            );
            toast({
                title: 'Error Deleting Note',
                description:
                    'An unexpected error occurred while deleting the note.',
                variant: 'destructive',
            });
            setIsDeleteDialogOpen(false);
        }
    };

    // Determine overall loading state
    const pageIsActuallyLoading =
        isLoading || noteLoading || (taskId && tasksLoading);

    const showNotFoundDueToMissingNote =
        dataReady && !currentNote && isEditing && noteId;

    if (pageIsActuallyLoading) {
        return (
            <div className="p-4 flex justify-center items-center min-h-[200px]">
                <div role="status" aria-label="Loading note editor">
                    <svg
                        aria-hidden="true"
                        className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                        />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                        />
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    if (showNotFoundDueToMissingNote) {
        return (
            <div className="p-4">
                Note not found or an error occurred. You may have been
                redirected.
            </div>
        );
    } else if (dataReady) {
        return (
            <div
                className="p-4 w-full h-full flex flex-col"
                id="note-editor-page-container">
                <header
                    className="mb-6 flex-shrink-0"
                    id="note-editor-page-header">
                    <h1
                        className="text-2xl font-bold"
                        id="note-editor-page-title">
                        {isEditing ? 'Edit Note' : 'Create New Note'}
                    </h1>
                    {initialTaskForNote && (
                        <p
                            className="text-sm text-muted-foreground"
                            id="note-editor-task-context">
                            For task: {initialTaskForNote.title}
                        </p>
                    )}
                </header>

                {/* This div will grow and allow NoteForm to scroll if content overflows */}
                <div
                    className="flex-grow overflow-y-auto"
                    id="note-form-scroll-container">
                    <NoteForm
                        onSubmit={handleSaveNote}
                        onCancel={handleCancel}
                        existingNote={currentNote}
                        initialTaskId={taskId} // Pass taskId from URL directly, NoteForm handles finding the task object
                    />
                </div>

                <div
                    className="mt-6 flex justify-between items-center gap-2 flex-shrink-0"
                    id="note-editor-actions-footer">
                    <div>
                        {isEditing && (
                            <AlertDialog
                                open={isDeleteDialogOpen}
                                onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        id="note-editor-delete-trigger-button">
                                        <Trash2 className="mr-2 h-4 w-4" />{' '}
                                        Delete Note
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle id="delete-note-dialog-title">
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        {/* Per accessibility memory, if DialogTitle is visible, sr-only is not needed here. 
                        If it were hidden, we'd add a sr-only title as first child of AlertDialogContent. */}
                                    </AlertDialogHeader>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will
                                        permanently delete the note.
                                    </AlertDialogDescription>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteConfirm}
                                            id="note-editor-confirm-delete-button">
                                            Yes, delete note
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            id="note-editor-cancel-button"
                            data-testid="note-editor-page-cancel-button"
                            variant="outline"
                            onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="note-form"
                            disabled={noteLoading}
                            id={
                                isEditing
                                    ? 'note-editor-save-button'
                                    : 'note-editor-create-button'
                            }>
                            {noteLoading
                                ? isEditing
                                    ? 'Saving...'
                                    : 'Creating...'
                                : isEditing
                                ? 'Save Changes'
                                : 'Create Note'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback: If not loading, and not dataReady, and not specifically a 'showNotFoundDueToMissingNote' case

    return (
        <div className="p-4">
            Note not found or an error occurred. You may have been redirected.
        </div>
    );
};

export default NoteEditorPage;
