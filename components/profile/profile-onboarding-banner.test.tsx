import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { ProfileOnboardingBanner } from './profile-onboarding-banner';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('ProfileOnboardingBanner Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('deve exibir o banner quando o perfil não estiver configurado e não estiver dispensado', () => {
    render(
      <ProfileOnboardingBanner
        hasProfile={false}
      />
    );

    expect(screen.getByText(/Personalize suas orientações financeiras/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Configurar Perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dispensar/i })).toBeInTheDocument();
  });

  it('não deve exibir o banner se o usuário já possuir perfil configurado', () => {
    const { container } = render(
      <ProfileOnboardingBanner
        hasProfile={true}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('não deve exibir o banner se já foi dispensado no sessionStorage', () => {
    sessionStorage.setItem('dismiss_profile_banner', 'true');

    const { container } = render(
      <ProfileOnboardingBanner
        hasProfile={false}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('deve salvar dispensa no sessionStorage e ocultar o banner ao clicar em Dispensar', () => {
    render(
      <ProfileOnboardingBanner
        hasProfile={false}
      />
    );

    const dismissBtn = screen.getByRole('button', { name: /Dispensar/i });
    fireEvent.click(dismissBtn);

    expect(sessionStorage.getItem('dismiss_profile_banner')).toBe('true');
    expect(screen.queryByText(/Personalize suas orientações financeiras/i)).not.toBeInTheDocument();
  });

  it('deve navegar para /settings/profile ao clicar em Configurar Perfil', () => {
    render(
      <ProfileOnboardingBanner
        hasProfile={false}
      />
    );

    const configBtn = screen.getByRole('button', { name: /Configurar Perfil/i });
    fireEvent.click(configBtn);

    expect(mockPush).toHaveBeenCalledWith('/settings/profile');
  });
});
