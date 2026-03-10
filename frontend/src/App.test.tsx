import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('should render without crashing', () => {
    // Attempting to render the app component
    // Note: Since App has BrowserRouter, it requires DOM context which testing-library provides
    render(<App />);
    
    // We can confidently assume our App renders if this does not throw an error
    expect(true).toBe(true);
  });
});
