import React, { useEffect, useState } from 'react';
import './App.css';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations'
import { API, Storage } from 'aws-amplify';


// Started off with a notes app from AWS tutorial and amended to required function
// Has authentication and option to login can be added using social media / google or amazon accounts

const initialFormState = { name: '', description: '' }

export default function App() {


  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  //  fecth tiles in library
  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  }

  // Create a tile function
  async function createNote() {
    if(!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  // Delete function - removes a tile
  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  // Image upload function
  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }



  return (
    <Authenticator>
      {({ signOut, user }) => (
    <main>
      <div className='App'>
      <h1>My Notes App</h1>
      <input 
        onChange={e => setFormData({ ...formData, 'name': e.target.value })}
        placeholder='Note name'
        value={formData.name}
      />

      <input 
        onChange={e => setFormData({...formData, 'description': e.target.value})}
        placeholder='Note description'
        value={formData.description}
      />

      <input
        type="file"
        onChange={onChange}
      />

      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name}>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              {
                note.image && <img src={note.image} style={{width: 400}} />
              }
              <button onClick={() => deleteNote(note)}>Delete note</button>
            </div>
          ))
        }
      </div>
      <button onClick={signOut}>Sign out</button>
      </div>
    </main>
      )}
    </Authenticator>
  );
}