import React, { useState, useMemo } from 'react';
import { useNoteStore } from '@/store/noteStore';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { NotebookText, Pencil, Home, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AllNotesPage: React.FC = () => {
  const { notes, deleteNote, deleteMultipleNotes } = useNoteStore(state => ({
    notes: state.notes,
    deleteNote: state.deleteNote, // Assuming deleteNote will be added to the store
    deleteMultipleNotes: state.deleteMultipleNotes, // Assuming deleteMultipleNotes will be added
  }));
  const location = useLocation();
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  // noteToDelete state is removed as each card will have its own AlertDialog
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState<boolean>(false); // For bulk delete confirmation

  const handleToggleSelectNote = (noteId: string) => {
    setSelectedNotes(prevSelected =>
      prevSelected.includes(noteId)
        ? prevSelected.filter(id => id !== noteId)
        : [...prevSelected, noteId]
    );
  };

  const allNotesSelected = useMemo(() => notes.length > 0 && selectedNotes.length === notes.length, [notes, selectedNotes]);

  const handleToggleSelectAll = () => {
    if (allNotesSelected) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notes.map(note => note.id));
    }
  };

  const handleDeleteSingleNote = (noteId: string) => {
    // In a real app, you'd call deleteNote from your store here
    console.log('Attempting to delete note:', noteId);
    deleteNote(noteId); // Actual deletion logic will be in store
    setSelectedNotes(prev => prev.filter(id => id !== noteId));
    // setNoteToDelete(null) is removed as noteToDelete state is removed
  };

  const handleDeleteSelectedNotes = () => {
    // In a real app, you'd call deleteMultipleNotes from your store here
    console.log('Attempting to delete selected notes:', selectedNotes);
    deleteMultipleNotes(selectedNotes); // Actual deletion logic will be in store
    setSelectedNotes([]);
    setShowBulkDeleteConfirm(false); // Close dialog
  };

  return (
    <div className="container mx-auto p-4" id="all-notes-page-container">
      {/* Single delete confirmation dialog is now per card, removing the top-level one. */}

      {/* Confirmation Dialog for Bulk Delete */} 
      {showBulkDeleteConfirm && (
        <AlertDialog open={showBulkDeleteConfirm} onOpenChange={() => setShowBulkDeleteConfirm(false)}>
          <AlertDialogContent id="bulk-note-delete-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle id="bulk-note-delete-dialog-title">Delete Selected Notes?</AlertDialogTitle>
              <AlertDialogDescription id="bulk-note-delete-dialog-description">
                This action cannot be undone. This will permanently delete {selectedNotes.length} note(s).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel id="bulk-note-delete-cancel-button">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSelectedNotes} id="bulk-note-delete-confirm-button">
                Delete Selected
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div id="all-notes-page-title-container" className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold flex items-center" id="all-notes-page-title">
            <NotebookText className="mr-2 h-8 w-8" />
            All Notes
          </h1>
          <p className="text-muted-foreground" id="all-notes-page-description">
            Browse and manage all your notes.
          </p>
        </div>
        <div className="flex items-center space-x-2" id="all-notes-actions-container">
          {selectedNotes.length > 0 && (
            <Button variant="destructive" onClick={() => setShowBulkDeleteConfirm(true)} id="bulk-delete-notes-button">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedNotes.length})
            </Button>
          )}
          <Button variant="outline" asChild id="back-to-home-button-all-notes">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {notes.length === 0 ? (
        <div className="text-center py-10" id="no-notes-message-container">
          <p className="text-xl text-muted-foreground" id="no-notes-message-text">You don't have any notes yet.</p>
          <Button asChild className="mt-4" id="create-first-note-button-all-notes">
            <Link to="/notes/new" state={{ from: location.pathname }}>Create your first note</Link>
          </Button>
        </div>
      ) : (
        <React.Fragment>{/* Using React.Fragment here as we have sibling divs for selection and grid */}
          <div className="mb-4 flex items-center space-x-2" id="notes-selection-controls-container">
            <Checkbox
              id="select-all-notes-checkbox"
              checked={allNotesSelected}
              onCheckedChange={handleToggleSelectAll}
              disabled={notes.length === 0}
              aria-label="Select all notes"
            />
            <label htmlFor="select-all-notes-checkbox" className="text-sm font-medium">
              {allNotesSelected ? 'Deselect All' : 'Select All'} ({selectedNotes.length} / {notes.length} selected)
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" id="notes-grid-container">
            {notes.map(note => (
              <Card key={note.id} id={`note-card-${note.id}`} data-testid={`note-card-${note.id}`} className={`relative ${selectedNotes.includes(note.id) ? 'border-primary border-2' : ''}`}>
                <CardHeader className="flex flex-row items-start space-x-2 p-4">
                  <Checkbox
                    id={`select-note-${note.id}`}
                    checked={selectedNotes.includes(note.id)}
                    onCheckedChange={() => handleToggleSelectNote(note.id)}
                    aria-labelledby={`note-title-${note.id}`}
                    className="mt-1"
                  />
                  <div className="flex-grow">
                    <CardTitle className="flex justify-between items-center" id={`note-title-${note.id}`} data-testid={`note-title-${note.id}`}>
                      {note.name || 'Untitled Note'}
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" asChild id={`edit-note-button-${note.id}`} data-testid={`edit-note-button-${note.id}`}>
                          <Link to={`/notes/${note.id}/edit`} state={{ from: location.pathname }}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">{`Edit note ${note.name || 'Untitled Note'}`}</span>
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" id={`delete-note-button-trigger-${note.id}`} data-testid={`delete-note-button-trigger-${note.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">{`Delete note ${note.name || 'Untitled Note'}`}</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent id={`single-note-delete-dialog-${note.id}`}>
                            <AlertDialogHeader>
                              <AlertDialogTitle id={`single-note-delete-dialog-title-${note.id}`}>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription id={`single-note-delete-dialog-description-${note.id}`}>
                                This action cannot be undone. This will permanently delete the note "{note.name || 'Untitled Note'}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel id={`single-note-delete-cancel-button-${note.id}`}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSingleNote(note.id)} id={`single-note-delete-confirm-button-${note.id}`}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardTitle>
                    {note.createdAt && (
                      <CardDescription id={`note-created-at-${note.id}`} data-testid={`note-created-at-${note.id}`}>
                        Created: {new Date(note.createdAt).toLocaleDateString()}
                      </CardDescription>
                    )}
                  </div> {/* End flex-grow div */}
                </CardHeader>
                <CardContent id={`note-content-preview-${note.id}`} data-testid={`note-content-preview-${note.id}`} className="p-4 pt-0">
                  <p className="line-clamp-3" id={`note-content-text-${note.id}`} data-testid={`note-content-text-${note.id}`}>
                    {note.body ? note.body.substring(0, 200) + (note.body.length > 200 ? '...' : '') : 'No content'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default AllNotesPage;
