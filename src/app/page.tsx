"use client"
import { useState, useEffect } from "react";

interface Note {
  id: number;
  title: string;
  content: string;
}

const apiUrl = "http://localhost:8000"; // Replace with your backend API URL

const NotesApp = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Fetch all notes
  const fetchNotes = async () => {
    if (!authToken) return;

    const response = await fetch(`${apiUrl}/notes`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    setNotes(data);
  };

  // Create a new note
  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();  // Prevent form submission and page refresh

    if (!authToken || !title || !content) return;

    const response = await fetch(`${apiUrl}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title, content }),
    });

    const newNote = await response.json();
    setNotes([...notes, newNote]);
    setTitle("");
    setContent("");
  };

  // Update an existing note
  const updateNote = async (id: number) => {
    if (!authToken || !title || !content) return;

    const response = await fetch(`${apiUrl}/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title, content }),
    });

    const updatedNote = await response.json();
    setNotes(notes.map((note) => (note.id === id ? updatedNote : note)));
    setTitle("");
    setContent("");
  };

  // Delete a note
  const deleteNote = async (id: number) => {
    if (!authToken) return;

    await fetch(`${apiUrl}/notes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    setNotes(notes.filter((note) => note.id !== id));
  };

  // Handle login for JWT (simplified example)
  const handleLogin = async (username: string, password: string) => {
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    setAuthToken(data.token);
  };

  useEffect(() => {
    if (authToken) {
      fetchNotes();
    }
  }, [authToken]);

  return (
    <div className="container">
      <h1>Notes App</h1>

      {!authToken ? (
        <div>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setContent(e.target.value)}
          />
          <button onClick={() => handleLogin(title, content)}>Login</button>
        </div>
      ) : (
        <div>
          <form onSubmit={createNote}> {/* Prevent form submit with this */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
            />
            <button type="submit">Create Note</button> {/* Now works as form submit */}
          </form>

          <div>
            {notes.map((note) => (
              <div key={note.id} className="note">
                <h3>{note.title}</h3>
                <p>{note.content}</p>
                <button onClick={() => updateNote(note.id)}>Update</button>
                <button onClick={() => deleteNote(note.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesApp;
