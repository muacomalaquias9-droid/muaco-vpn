# Angola VPN - TODO List

## Fase 1: MVP - Funcionalidades Essenciais

### Design & Assets
- [x] Gerar logo/ícone da aplicação
- [x] Gerar ícones para abas (Home, Servers, Settings)
- [x] Criar splash screen
- [x] Configurar cores no theme.config.js

### Home Screen
- [x] Criar layout principal com botão toggle central
- [x] Implementar indicador de status VPN (conectado/desconectado)
- [x] Mostrar servidor atual selecionado
- [x] Exibir IP atual
- [x] Exibir velocidade de conexão (simulada inicialmente)
- [x] Implementar animação do botão toggle
- [x] Adicionar feedback tátil (haptics)

### Server Selection Screen
- [x] Criar lista de servidores com países
- [x] Integrar API do VPN Gate para obter servidores
- [x] Exibir bandeiras dos países
- [x] Mostrar ping/latência
- [x] Implementar busca/filtro por país
- [x] Adicionar funcionalidade de seleção de servidor

### Settings Screen
- [x] Criar layout de configurações
- [x] Adicionar toggle para protocolo VPN
- [x] Adicionar toggle para Kill Switch
- [x] Adicionar toggle para Auto-connect
- [x] Mostrar versão da app
- [x] Adicionar botão "Sobre"

### Permissões Android
- [x] Configurar app.config.ts com permissões necessárias
- [ ] Solicitar permissões em runtime (Android 6+)
- [ ] Verificar permissões de VPN

### Lógica VPN (Simulada)
- [x] Implementar estado de conexão (conectando, conectado, desconectado)
- [x] Simular conexão/desconexão com delay
- [x] Armazenar servidor selecionado em AsyncStorage
- [x] Armazenar configurações em AsyncStorage

## Fase 2: Melhorias Visuais & UX

- [ ] Adicionar animações suaves em transições
- [ ] Implementar dark mode completo
- [ ] Adicionar ícones SVG customizados
- [ ] Melhorar tipografia e espaçamento
- [ ] Adicionar loading states em todos os ecrãs
- [ ] Implementar error handling com mensagens claras

## Fase 3: Funcionalidades Avançadas

- [ ] Implementar favoritos de servidores
- [ ] Adicionar histórico de conexões
- [ ] Implementar logs de conexão
- [ ] Adicionar notificações de status
- [ ] Implementar reconexão automática
- [ ] Adicionar estatísticas de uso

## Fase 4: Build & Deploy

- [ ] Testar em Android real
- [ ] Gerar APK para distribuição
- [ ] Configurar branding final
- [ ] Criar documentação de uso
- [ ] Preparar para publicação

## Status: Em Progresso

Última atualização: 2026-03-19


## Fase 3: Renomear para Muaco VPN

- [x] Atualizar app.config.ts com nome "Muaco VPN"
- [x] Gerar novo logo/ícone com branding Muaco
- [x] Atualizar splash screen
- [x] Atualizar cores da paleta (se necessário)
- [x] Renomear projeto para muaco-vpn

## Fase 4: Integração Real de VPN

- [x] Instalar OpenVPN SDK ou expo-openvpn
- [x] Implementar conexão real com servidores VPN Gate
- [x] Criar serviço VPN em background
- [x] Gerenciar certificados OpenVPN
- [x] Implementar desconexão segura
- [ ] Testar conexão real em dispositivo Android

## Fase 5: Permissões em Runtime

- [x] Implementar hook usePermissions
- [x] Solicitar permissões ao abrir app
- [x] Tratar recusas de permissões
- [x] Mostrar mensagens explicativas
- [x] Permitir usuário solicitar permissões novamente
- [x] Verificar permissões antes de conectar VPN

## Fase 6: Notificações Push

- [x] Configurar expo-notifications
- [x] Criar serviço de notificações
- [x] Notificar ao conectar VPN
- [x] Notificar ao desconectar VPN
- [x] Notificar erros de conexão
- [ ] Notificar quando VPN cai (Kill Switch)
- [ ] Permitir usuário desabilitar notificações
