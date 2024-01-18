import React, { createContext, useContext, useReducer } from 'react';

// Create a context for managing dues data
const DuesContext = createContext();

// Define the initial state for dues
const initialState = {
  dues: [],
};

// Define a reducer function to update dues
function duesReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_DUES':
      return {
        ...state,
        dues: action.payload,
      };
    default:
      return state;
  }
}

// Create a provider component to wrap your application with the dues context
export function DuesProvider({ children }) {
  const [state, dispatch] = useReducer(duesReducer, initialState);

  return (
    <DuesContext.Provider value={{ state, dispatch }}>
      {children}
    </DuesContext.Provider>
  );
}

// Create a custom hook to access the dues context
export function useDuesContext() {
  const context = useContext(DuesContext);
  if (!context) {
    throw new Error('useDuesContext must be used within a DuesProvider');
  }
  return context;
}
