import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Wordmark } from '@/components/brand/Wordmark';
import { DemoBar } from '@/components/demo/DemoBar';
import { LandingPage } from '@/features/public/LandingPage';
import { MemoryRouter } from 'react-router-dom';

describe('App smoke component test', () => {
  it('renders Trove Club wordmark component', () => {
    render(<Wordmark />);
    expect(screen.getByLabelText('Trove Club')).toBeInTheDocument();
  });

  it('renders DemoBar component', () => {
    render(
      <MemoryRouter>
        <DemoBar />
      </MemoryRouter>
    );
    expect(screen.getByText(/Trove Club Demo/i)).toBeInTheDocument();
  });

  it('renders LandingPage view', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/365 Days of Summer Loyalty/i)).toBeInTheDocument();
  });
});
