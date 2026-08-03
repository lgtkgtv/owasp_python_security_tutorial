import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DockerLabsPortal from './DockerLabsPortal';

describe('DockerLabsPortal', () => {
  it('renders all 25 module cards by default', () => {
    render(<DockerLabsPortal onBack={() => {}} />);
    // 24 modules => 24 "Vulnerable :" links and 24 "Secure :" links
    const vulnLinks = screen.getAllByText(/^Vulnerable :\d+$/);
    const secureLinks = screen.getAllByText(/^Secure :\d+$/);
    expect(vulnLinks).toHaveLength(25);
    expect(secureLinks).toHaveLength(25);
  });

  it('filters down to 10 LLM modules when the LLM track button is clicked', () => {
    render(<DockerLabsPortal onBack={() => {}} />);
    fireEvent.click(screen.getByText(/^LLM \(10\)$/));
    const vulnLinks = screen.getAllByText(/^Vulnerable :\d+$/);
    expect(vulnLinks).toHaveLength(10);
  });

  it('filters down to 15 Web modules when the Web track button is clicked', () => {
    render(<DockerLabsPortal onBack={() => {}} />);
    fireEvent.click(screen.getByText(/^Web \(15\)$/));
    const vulnLinks = screen.getAllByText(/^Vulnerable :\d+$/);
    expect(vulnLinks).toHaveLength(15);
  });

  it('narrows results via the search box', () => {
    render(<DockerLabsPortal onBack={() => {}} />);
    const search = screen.getByPlaceholderText(/Filter by name/i);
    fireEvent.change(search, { target: { value: 'sql' } });
    expect(screen.getByText('SQL Injection (SQLi)')).toBeInTheDocument();
    expect(screen.queryByText('Cross-Site Scripting (XSS)')).not.toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', () => {
    const onBack = vi.fn();
    render(<DockerLabsPortal onBack={onBack} />);
    fireEvent.click(screen.getByText(/Back to all modules/i));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows the feedback contact info', () => {
    render(<DockerLabsPortal onBack={() => {}} />);
    expect(screen.getByText(/Sachin Godse/)).toBeInTheDocument();
    const mailLink = screen.getByText('lgtkgtv+sachin-godse@gmail.com');
    expect(mailLink.closest('a')).toHaveAttribute('href', 'mailto:lgtkgtv+sachin-godse@gmail.com');
  });
});
