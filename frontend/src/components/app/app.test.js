import { render, screen } from '@testing-library/react';
import App from './app';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByRole('link', { name: /вход/i });
  expect(linkElement).toBeInTheDocument();
});
