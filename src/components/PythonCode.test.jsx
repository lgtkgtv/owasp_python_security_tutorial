import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PythonCode from './PythonCode';

describe('PythonCode', () => {
  it('renders the provided code text', () => {
    render(<PythonCode code={"import os\nprint('hi')"} />);
    expect(screen.getByText(/print/)).toBeInTheDocument();
  });
});
