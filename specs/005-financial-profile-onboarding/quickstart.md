# Quickstart: Perfil Financeiro, Regime de Renda e Metas do Usuário

**Feature**: `005-financial-profile-onboarding`  
**Date**: 2026-10-19  

---

## 1. Fluxo de Uso Rápido

1. **Acessar a Aplicação**:
   - Faça login com usuário e senha.
2. **Visualizar o Banner de Convite**:
   - No Dashboard inicial, observe o banner convidando a configurar o perfil.
   - Clique em **"Configurar Perfil"** (ou no menu do usuário / Sidebar em **"Perfil Financeiro"**).
3. **Preencher os Dados**:
   - Selecione seu Regime de Renda (ex: *CLT* ou *PJ / Autônomo*).
   - Digite sua renda mensal estimada (ex: *R$ 7.500,00*).
   - Marque uma ou mais Metas Financeiras (ex: *Reserva de Emergência*, *Quitar Dívidas*).
   - Selecione sua Tolerância a Risco (ex: *Moderado*).
   - Clique em **"Salvar Perfil"**.
4. **Verificar Feedback**:
   - Observe a notificação toast de sucesso: *"Perfil financeiro atualizado com sucesso!"*.
   - Volte ao Dashboard: note que o banner foi ocultado e a IA levará em conta suas metas e regime de trabalho nas próximas análises.

---

## 2. Comandos de Validação e Testes

```bash
# 1. Executar bateria de testes automatizados
npm test -- --run

# 2. Verificar tipagem TypeScript estrita
npx tsc --noEmit

# 3. Rodar servidor de desenvolvimento
npm run dev
```
