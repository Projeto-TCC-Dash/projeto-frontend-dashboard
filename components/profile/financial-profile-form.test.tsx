import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { FinancialProfileForm } from './financial-profile-form';

describe('FinancialProfileForm Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário com campos vazios e mensagem de voluntariedade', () => {
    render(<FinancialProfileForm onSubmit={mockOnSubmit} isPending={false} />);

    expect(screen.getByText(/Regime de Trabalho e Renda/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Renda Mensal Declarada/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Metas Financeiras Prioritárias/i)).toBeInTheDocument();
    expect(screen.getByText(/Perfil de Tolerância a Risco/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar Perfil/i })).toBeInTheDocument();
  });

  it('deve preencher valores iniciais quando fornecidos', () => {
    const initialData = {
      incomeType: 'CLT' as const,
      declaredMonthlyIncome: 5500,
      goals: ['RESERVA_EMERGENCIA' as const],
      riskProfile: 'CONSERVATIVE' as const,
    };

    render(
      <FinancialProfileForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        isPending={false}
      />
    );

    const incomeInput = screen.getByLabelText(/Renda Mensal Declarada/i) as HTMLInputElement;
    expect(incomeInput.value).toContain('5.500,00');
  });

  it('deve permitir selecionar regime, alterar renda, selecionar metas e submeter dados', async () => {
    render(<FinancialProfileForm onSubmit={mockOnSubmit} isPending={false} />);

    // Seleciona regime PJ
    const pjOption = screen.getByText(/PJ \/ Autônomo/i);
    fireEvent.click(pjOption);

    // Digita renda declarada
    const incomeInput = screen.getByLabelText(/Renda Mensal Declarada/i);
    fireEvent.change(incomeInput, { target: { value: '8500' } });

    // Clica em duas metas
    const metaReserva = screen.getByText(/Criar \/ Expandir Reserva de Emergência/i);
    fireEvent.click(metaReserva);

    const metaInvestir = screen.getByText(/Investir para Longo Prazo/i);
    fireEvent.click(metaInvestir);

    // Clica em perfil moderado
    const riskModerado = screen.getByRole('button', { name: /Moderado/i });
    fireEvent.click(riskModerado);

    // Submete
    const submitBtn = screen.getByRole('button', { name: /Salvar Perfil/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        incomeType: 'PJ_AUTONOMO',
        declaredMonthlyIncome: 8500,
        goals: expect.arrayContaining(['RESERVA_EMERGENCIA', 'INVESTIR_LONGO_PRAZO']),
        riskProfile: 'MODERATE',
      })
    );
  });

  it('deve desabilitar botão e exibir estado de carregamento quando isPending for true', () => {
    render(<FinancialProfileForm onSubmit={mockOnSubmit} isPending={true} />);

    const submitBtn = screen.getByRole('button', { name: /Salvando/i });
    expect(submitBtn).toBeDisabled();
  });
});
