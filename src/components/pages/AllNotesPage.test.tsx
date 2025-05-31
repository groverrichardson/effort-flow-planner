import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import AllNotesPage from './AllNotesPage';
import { useNoteStore } from '@/store/noteStore';
import { Note } from '@/types/note';

// Mock lucide-react icons
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    NotebookText: () => <svg data-testid="notebook-icon" />,
    Pencil: () => <svg data-testid="pencil-icon" />,
    Home: () => <svg data-testid="home-icon" />,
    PlusCircle: () => <svg data-testid="plus-circle-icon" />,
  };
});

// Mock useNoteStore
const mockNotes: Note[] = [
  {
    id: 'note-1',
    name: 'Test Note 1',
    body: 'Body of test note 1',
    createdAt: new Date('2023-01-01T10:00:00Z'),
    updatedAt: new Date('2023-01-01T11:00:00Z'),
    taggedTaskIds: [],
  },
  {
    id: 'note-2',
    name: 'Test Note 2',
    body: 'Body of test note 2',
    createdAt: new Date('2023-01-02T14:00:00Z'),
    updatedAt: new Date('2023-01-02T15:00:00Z'),
    taggedTaskIds: ['task-1'],
  },
];

const mockUseNoteStore = useNoteStore as any;
vi.mock('@/store/noteStore', () => ({
  useNoteStore: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (initialEntries = ['/notes']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/notes" element={<AllNotesPage />} />
        <Route path="/" element={<div>Home Page Mock</div>} />
        <Route path="/notes/new" element={<div>New Note Page Mock</div>} />
        <Route path="/notes/:noteId/edit" element={<div>Edit Note Page Mock</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('AllNotesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title and description', () => {
    mockUseNoteStore.mockReturnValue({ notes: [] });
    renderWithRouter();
    expect(screen.getByText('All Notes')).toBeInTheDocument();
    expect(screen.getByText('Browse and manage all your notes.')).toBeInTheDocument();
    expect(screen.getByTestId('notebook-icon')).toBeInTheDocument();
  });

  it('renders the "Back to Home" button and navigates on click', () => {
    mockUseNoteStore.mockReturnValue({ notes: [] });
    renderWithRouter();
    const homeButton = screen.getByRole('link', { name: /Back to Home/i });
    expect(homeButton).toBeInTheDocument();
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    fireEvent.click(homeButton);
    expect(screen.getByText('Home Page Mock')).toBeInTheDocument(); // Check navigation
  });

  describe('when there are no notes', () => {
    beforeEach(() => {
      mockUseNoteStore.mockReturnValue({ notes: [] });
    });

    it('displays the "No notes available" message', () => {
      renderWithRouter();
      expect(screen.getByText(/You don't have any notes yet./i)).toBeInTheDocument();
      
    });

    it('renders the "Create your first note" button and navigates on click', () => {
      renderWithRouter();
      const createNoteButton = screen.getByRole('link', { name: /Create your first note/i });
      expect(createNoteButton).toBeInTheDocument();
      
      fireEvent.click(createNoteButton);
      expect(screen.getByText('New Note Page Mock')).toBeInTheDocument(); // Check navigation
    });
  });

  describe('when notes exist', () => {
    beforeEach(() => {
      mockUseNoteStore.mockReturnValue({ notes: mockNotes });
    });

    it('renders a list of note cards', () => {
      renderWithRouter();
      expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      expect(screen.getByText('Test Note 2')).toBeInTheDocument();
      expect(screen.getAllByTestId(/^note-card-/).length).toBe(mockNotes.length);
    });

    it('displays note details correctly on each card', () => {
      renderWithRouter();
      const note1 = mockNotes[0];
      expect(screen.getByText(note1.name)).toBeInTheDocument();
      // Check for formatted date - adjust regex if format is different
      expect(screen.getByText((content, element) => content.startsWith('Created:') && content.includes(new Date(note1.createdAt).toLocaleDateString()))).toBeInTheDocument();
      const editLinkNote1 = screen.getByRole('link', { name: `Edit note ${note1.name}` });
      expect(editLinkNote1).toBeInTheDocument();
      expect(editLinkNote1).toHaveAttribute('href', `/notes/${note1.id}/edit`);
    });

    it('navigates to the edit page when an edit link is clicked', () => {
      renderWithRouter();
      const note2 = mockNotes[1];
      const editLinkNote2 = screen.getByRole('link', { name: `Edit note ${note2.name}` });
      fireEvent.click(editLinkNote2);
      expect(screen.getByText('Edit Note Page Mock')).toBeInTheDocument(); // Check navigation
    });
  });
});
