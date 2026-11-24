import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { CurrencyInput, parseRupeesToPaise } from '@/components/forms/CurrencyInput';
import { OtpInput } from '@/components/forms/OtpInput';
import { DayMonthPicker, getMaxDaysInMonth } from '@/components/forms/DayMonthPicker';
import { DataTable } from '@/components/data/DataTable';

describe('PhoneInput', () => {
  it('strips non-digits and triggers onChange with clean numeric string', async () => {
    const handleChange = vi.fn();
    render(<PhoneInput value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '987-abc-654' } });
    expect(handleChange).toHaveBeenCalledWith('987654');
  });

  it('formats display value as 5 digits space 5 digits', () => {
    render(<PhoneInput value="9876543210" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('98765 43210');
  });
});

describe('CurrencyInput', () => {
  it('parses string rupees to integer paise accurately', () => {
    expect(parseRupeesToPaise('4,990.50')).toBe(499050);
    expect(parseRupeesToPaise('2000')).toBe(200000);
    expect(parseRupeesToPaise('0.5')).toBe(50);
    expect(parseRupeesToPaise('-100')).toBeNull();
  });

  it('calls onChangePaise when user enters amount', () => {
    const handleChange = vi.fn();
    render(<CurrencyInput valuePaise={0} onChangePaise={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '500' } });
    expect(handleChange).toHaveBeenCalledWith(50000);
  });
});

describe('OtpInput', () => {
  it('renders a single numeric input with 6 visual cells', () => {
    render(<OtpInput value="" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox', { name: /verification code/i });
    expect(input).toBeInTheDocument();
    expect(screen.getByTestId('otp-cell-0')).toBeInTheDocument();
    expect(screen.getByTestId('otp-cell-5')).toBeInTheDocument();
  });

  it('triggers onComplete when all 6 digits are entered', () => {
    const handleComplete = vi.fn();
    const handleChange = vi.fn();
    render(<OtpInput value="12345" onChange={handleChange} onComplete={handleComplete} />);
    const input = screen.getByRole('textbox', { name: /verification code/i });
    fireEvent.change(input, { target: { value: '123456' } });
    expect(handleChange).toHaveBeenCalledWith('123456');
    expect(handleComplete).toHaveBeenCalledWith('123456');
  });

  it('handles paste and fast typing by stripping non-numeric characters', () => {
    const handleChange = vi.fn();
    render(<OtpInput value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox', { name: /verification code/i });
    fireEvent.change(input, { target: { value: '482-913' } });
    expect(handleChange).toHaveBeenCalledWith('482913');
  });
});

describe('DayMonthPicker', () => {
  it('caps max days for February to 29 and April to 30', () => {
    expect(getMaxDaysInMonth(2)).toBe(29);
    expect(getMaxDaysInMonth(4)).toBe(30);
    expect(getMaxDaysInMonth(1)).toBe(31);
  });

  it('adjusts day when month change makes day invalid', () => {
    const handleChange = vi.fn();
    render(
      <DayMonthPicker
        value={{ day: 31, month: 1 }}
        onChange={handleChange}
      />
    );
    const monthSelect = screen.getByLabelText('Month');
    fireEvent.change(monthSelect, { target: { value: '4' } }); // April has 30 days
    expect(handleChange).toHaveBeenCalledWith({ day: 30, month: 4 });
  });
});

describe('DataTable', () => {
  const sampleData = [
    { id: '1', name: 'Tara', points: 1438 },
    { id: '2', name: 'Kabir', points: 1000 },
  ];

  it('renders table headers and row content', () => {
    render(
      <DataTable
        data={sampleData}
        keyExtractor={(i) => i.id}
        columns={[
          { id: 'name', header: 'Name', cell: (i) => i.name, sortable: true },
          { id: 'points', header: 'Points', cell: (i) => i.points },
        ]}
      />
    );

    expect(screen.getAllByText('Tara')).toHaveLength(2); // 1 mobile card + 1 desktop row
    expect(screen.getAllByText('Kabir')).toHaveLength(2);
  });

  it('calls onSort when sortable header button is clicked', () => {
    const handleSort = vi.fn();
    render(
      <DataTable
        data={sampleData}
        keyExtractor={(i) => i.id}
        onSort={handleSort}
        columns={[
          { id: 'name', header: 'Name', cell: (i) => i.name, sortable: true },
        ]}
      />
    );

    const sortButton = screen.getByRole('button', { name: /Sort by name/i });
    fireEvent.click(sortButton);
    expect(handleSort).toHaveBeenCalledWith('name');
  });
});
