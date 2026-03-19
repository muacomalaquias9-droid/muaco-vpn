# Design da Aplicação VPN Angola - Inspirado em Omanova VPN

## Visão Geral

A aplicação VPN Angola é uma solução segura e rápida para proteger dados em Angola e outros países. O design segue a filosofia da Omanova VPN: simples, intuitivo e focado em segurança com um toque moderno.

## Paleta de Cores

| Elemento | Cor | Uso |
|----------|-----|-----|
| **Primary (Tint)** | `#0066CC` (Azul Vibrante) | Botões principais, toggle VPN, destaques |
| **Background** | `#FFFFFF` (Branco) | Fundo principal (light mode) |
| **Background Dark** | `#0F1419` (Cinzento Escuro) | Fundo (dark mode) |
| **Surface** | `#F5F7FA` (Cinzento Claro) | Cards, superfícies elevadas |
| **Surface Dark** | `#1A1F26` | Cards em dark mode |
| **Foreground** | `#1A1A1A` (Preto) | Texto principal |
| **Muted** | `#6B7280` (Cinzento) | Texto secundário |
| **Success** | `#10B981` (Verde) | Conexão ativa, status OK |
| **Warning** | `#F59E0B` (Laranja) | Aviso, velocidade baixa |
| **Error** | `#EF4444` (Vermelho) | Erro, desconectado |

## Estrutura de Ecrãs

### 1. **Home Screen (Principal)**
- **Conteúdo Principal:**
  - Indicador de status VPN (grande, central)
  - Botão de toggle ON/OFF (circular, animado)
  - Servidor atual selecionado (país, bandeira, ping)
  - Velocidade de conexão (upload/download)
  - IP atual (antes/depois de conectar)
  - Botão "Selecionar Servidor"

- **Funcionalidade:**
  - Tap no botão central para conectar/desconectar
  - Animação suave ao conectar (spinner, mudança de cor)
  - Mostrar status em tempo real (conectando, conectado, desconectado)

### 2. **Server Selection Screen**
- **Conteúdo Principal:**
  - Barra de pesquisa para filtrar países
  - Lista de servidores por país (com bandeira)
  - Ping/latência para cada servidor
  - Velocidade estimada
  - Indicador de carga do servidor (barra de progresso)

- **Funcionalidade:**
  - Tap para selecionar servidor
  - Ordenar por: Ping, Velocidade, Localização
  - Favoritos (coração para marcar servidores preferidos)

### 3. **Settings Screen**
- **Conteúdo Principal:**
  - Protocolo VPN (OpenVPN, WireGuard)
  - Kill Switch (toggle)
  - Split Tunneling (toggle)
  - Auto-connect (toggle)
  - Permissões (verificar/solicitar)
  - Sobre a aplicação
  - Versão e logs

- **Funcionalidade:**
  - Alternar configurações
  - Visualizar/limpar logs de conexão
  - Informações de segurança

### 4. **Connection Details Screen**
- **Conteúdo Principal:**
  - Servidor conectado
  - Tempo de conexão
  - Dados transferidos (upload/download)
  - Protocolo utilizado
  - Encriptação (AES-256)
  - Botão de desconectar

## Fluxos de Utilizador Principais

### Fluxo 1: Conectar à VPN
1. Utilizador abre a app
2. Vê o botão central de toggle (OFF)
3. Tap no botão → animação de loading
4. Servidor padrão é selecionado
5. Conexão estabelecida → botão fica verde, mostra "Conectado"
6. IP muda, velocidade é exibida

### Fluxo 2: Mudar Servidor
1. Utilizador na Home Screen
2. Tap em "Selecionar Servidor"
3. Navega para Server Selection Screen
4. Procura por país (ex: "Angola")
5. Tap no servidor desejado
6. Se conectado, reconecta ao novo servidor
7. Volta para Home Screen

### Fluxo 3: Desconectar
1. Utilizador na Home Screen (conectado)
2. Tap no botão central (verde)
3. Animação de desconexão
4. Botão volta a OFF (cinzento)
5. IP volta ao original

## Animações

| Elemento | Animação | Duração |
|----------|----------|---------|
| **Botão Toggle** | Scale 0.95 + fade | 80ms |
| **Loading Spinner** | Rotação contínua | 2s |
| **Status Change** | Fade + color transition | 300ms |
| **Card Entrance** | Slide up + fade | 250ms |
| **Server List** | Stagger children | 150ms entre items |

## Ícones Principais

- **VPN Connected**: Escudo com cadeado
- **VPN Disconnected**: Escudo vazio
- **Settings**: Engrenagem
- **Server**: Globo/Mapa
- **Speed**: Raio/Velocidade
- **Security**: Cadeado
- **Favorite**: Coração

## Permissões Android (AndroidManifest.xml)

```xml
<!-- Rede e Internet -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
<uses-permission android:name="android.permission.BIND_VPN_SERVICE" />

<!-- Dispositivo e Sistema -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />

<!-- Segurança (Opcional) -->
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
```

## Servidores VPN

A aplicação utiliza a API pública do **VPN Gate** para obter uma lista dinâmica de servidores gratuitos:
- **Endpoint**: `https://www.vpngate.net/api/iphone/`
- **Formato**: CSV com dados de servidores (IP, porta, país, ping)
- **Atualização**: Sincroniza a cada 30 minutos ou ao abrir a app

Servidores prioritários para Angola:
1. Servidores em Angola (se disponíveis)
2. Servidores em países vizinhos (Moçambique, Zâmbia)
3. Servidores em Portugal (conexão rápida)
4. Servidores globais (fallback)

## Responsividade

- **Orientação**: Portrait (9:16)
- **Uso com uma mão**: Todos os botões principais no terço inferior da tela
- **SafeArea**: Respeita notch e home indicator
- **Adaptação**: Funciona em ecrãs de 4.5" a 6.7"

## Padrões de Interação (iOS HIG)

- **Feedback Tátil**: Haptic feedback em conexão/desconexão
- **Estados Visuais**: Pressed, disabled, loading
- **Transições**: Suaves, sem saltos abruptos
- **Tipografia**: San Francisco (sistema), tamanhos: 12, 14, 16, 18, 24, 32
- **Espaçamento**: Múltiplos de 4px (4, 8, 12, 16, 20, 24, 32)

## Prioridades de Implementação

1. **MVP**: Home screen com toggle, lista de servidores, settings básicos
2. **V1.1**: Animações, favoritos, auto-connect
3. **V1.2**: Kill switch, split tunneling, logs detalhados
4. **V1.3**: Temas customizados, notificações push
