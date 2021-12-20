import React, { useEffect, useState } from 'react';
import './App.css';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations'
import { API, Storage } from 'aws-amplify';
import { Transition } from "@headlessui/react";

// Started off with a notes app from AWS tutorial and amended to required function
// Has authentication and option to login can be added using social media / google or amazon accounts

const initialFormState = { 
  name: '', 
  description: '',
  genre: '',
  releaseDate: '',
  players: '',
  publisher: '',
  image: '',
 }

export default function App() {

  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  //  fecth tiles in library
  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
      }
    }))
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
        <>
    
      {/* Navigation */}
      <nav className="bg-white-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-5">
              <div className="flex-shrink-0">
                <a className="h-8 w-8" href="https://www.playstation.com" aria-label="PlayStation.com">
                  <svg class="shared-nav-ps-logo" width="50px" height="50px" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                    <g>
                      <g>
                        <path d="M5.8,32.1C4.3,33.1,4.8,35,8,35.9c3.3,1.1,6.9,1.4,10.4,0.8c0.2,0,0.4-0.1,0.5-0.1v-3.4l-3.4,1.1
                    c-1.3,0.4-2.6,0.5-3.9,0.2c-1-0.3-0.8-0.9,0.4-1.4l6.9-2.4V27l-9.6,3.3C8.1,30.7,6.9,31.3,5.8,32.1z M29,17.1v9.7
                    c4.1,2,7.3,0,7.3-5.2c0-5.3-1.9-7.7-7.4-9.6C26,11,23,10.1,20,9.5v28.9l7,2.1V16.2c0-1.1,0-1.9,0.8-1.6C28.9,14.9,29,16,29,17.1z
                      M42,29.8c-2.9-1-6-1.4-9-1.1c-1.6,0.1-3.1,0.5-4.5,1l-0.3,0.1v3.9l6.5-2.4c1.3-0.4,2.6-0.5,3.9-0.2c1,0.3,0.8,0.9-0.4,1.4
                    l-10,3.7V40L42,34.9c1-0.4,1.9-0.9,2.7-1.7C45.4,32.2,45.1,30.8,42,29.8z" fill="#0070d1"></path>
                      </g>
                    </g>
                  </svg>
                </a>
              </div>
              </div>
              <div class="hidden md:flex items-center space-x-2">
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                <button onClick={signOut} type="button" class="m-2 px-6 py-2 bg-gray-600 text-white rounded-full shadow-sm hover:bg-blue-500 focus:ring-2 focus:ring-gray-200">sign out</button>
                </div>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
            <button onClick={signOut} type="button" class="m-2 px-6 py-2 bg-gray-600 text-white rounded-full shadow-sm hover:bg-blue-500 focus:ring-2 focus:ring-gray-200">sign out</button> 
            </div>
          </div>
        </div>
      </nav>

      
      
    


    <main>
      <div className='App'>
      {/* main intro */}
      
      <h1>My Notes App</h1>


      <input 
        type="text"
        onChange={e => setFormData({ ...formData, 'name': e.target.value })}
        placeholder='Title Name'
        value={formData.name}
      />

      <input 
        type="text"
        onChange={e => setFormData({...formData, 'description': e.target.value})}
        placeholder='System Platform'
        value={formData.description}
      />

      <input 
        type="text"
        onChange={e => setFormData({...formData, 'genre': e.target.value})}
        placeholder='Title Genre'
        value={formData.genre}
      />

      <input
        type="date" 
        onChange={e => setFormData({...formData, 'releaseDate': e.target.value})}
        placeholder='Release Date'
        value={formData.releaseDate}
      />

      <input
        type="number"
        onChange={e => setFormData({...formData, 'players': e.target.value})}
        placeholder='No. of players'
        value={formData.players}
      />

      <input
        type="text"
        onChange={e => setFormData({...formData, 'publisher': e.target.value})}
        placeholder='Publisher'
        value={formData.publisher}
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
              <p>{note.genre}</p>
              <p>{note.releaseDate}</p>
              <p>{note.players}</p>
              <p>{note.publisher}</p>
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
    </>
      )}
    </Authenticator>
  );
}