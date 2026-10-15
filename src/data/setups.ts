import { b, c, cur, it, roundSegs, segs, segsR, t, type Line } from '../lib/term';

export interface Setup {
  id: string;
  name: string;
  /** marca la configuración propia del autor */
  mine?: boolean;
  vibes: Vibe[];
  tag: string;
  desc: string;
  /** título de la ventana */
  window: string;
  /** barra de ventana; por defecto, la de macOS */
  chrome?: 'win' | 'gnome';
  font: string;
  /** font-feature-settings */
  ff?: string;
  lh?: number;
  /** ancho del cursor */
  cw?: string;
  frame?: string;
  bar?: string;
  /** cada clave se convierte en una variable CSS de la terminal */
  palette: Record<string, string>;
  swatches: string[];
  lines: Line[];
  /** barra de estado de tmux: [izquierda (HTML), derecha] */
  status?: [string, string];
  /** [etiqueta, valor en HTML] */
  specs: [string, string][];
  install: string;
}

export const VIBES = { all: 'Todos', hacker: 'Hacker', powerline: 'Powerline', minimal: 'Minimal', pastel: 'Pastel', retro: 'Retro' };
export type Vibe = Exclude<keyof typeof VIBES, 'all'>;

/* ══════════ prompts reutilizados ══════════ */
const guyenTop = (extra = '') =>
  c('green', '┌──[') + b('neon', 'Guyen') + c('green', ']─[') + b('pink', '◈ 10.10.14.7') +
  c('green', ']─[') + b('fg', '~/ctf/box') + c('green', ']─[') + b('cyan', '⎇ main') +
  c('green', ']─[') + b('yellow', '!2') + c('green', ']') + extra;

const p10kTop = () => c('dim', '╭─') + segs(
  ['#3a3a3a', '#ffffff', ' ◆ '],
  ['#0087af', '#ffffff', ' ~/proyectos/web '],
  ['#d7af00', '#000000', ' ⎇ main !1 ?1 ']);
const p10kRight = (time: string) => segsR(
  ['#3a3a3a', '#5faf00', ' ✔ '],
  ['#5faf00', '#000000', ' ⬢ 20.11 '],
  ['#d0d0d0', '#000000', ` ${time} `]) + c('dim', '─╮');

const catTop = (time: string) => roundSegs(
  ['red', 'crust', ' ◆ user '], ['peach', 'crust', ' ~/dotfiles '], ['yellow', 'crust', ' ⎇ main '],
  ['green', 'crust', ' ⬢ v22.9 '], ['lavender', 'crust', ` ◷ ${time} `]);

const kaliTop = () => c('green', '┌──(') + b('blue', 'kali㉿kali') + c('green', ')-[') + b('fg', '~/htb/lame') + c('green', ']');

const gruvTop = (time: string) => roundSegs(
  ['orange', 'bg0', ' ◆ user '], ['yellow', 'bg0', ' ~/notes '], ['aqua', 'bg0', ' ⎇ main '],
  ['blue', 'bg0', ' ⬢ py 3.12 '], ['bg2', 'fg', ` ◷ ${time} `]);

const pureTop = (time = '') => c('purple', '~/proyectos/api') + ' ' + c('comment', 'main*') + (time ? ' ' + c('yellow', time) : '');

const ompTop = () => roundSegs(
  ['#c386f1', '#ffffff', ' guyen '], ['#ff479c', '#ffffff', ' ~\\repos\\web '],
  ['#fffb38', '#193549', ' ⎇ main ≡ '], ['#6ca35e', '#ffffff', ' ⬢ 20.11 ']);

/* ══════════ configuraciones ══════════ */
export const SETUPS: Setup[] = [
  {
    id: 'guyen',
    name: 'Guyen · h4ck3r edition',
    mine: true,
    vibes: ['hacker'],
    tag: 'Kitty · zsh · Starship',
    desc: 'Mi configuración: Kitty con la paleta de Ubuntu, zsh sin framework y un prompt de Starship de dos líneas pensado para CTFs, que muestra la IP de la VPN.',
    window: 'kitty — ~/ctf/box',
    font: "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace",
    ff: '"zero" 1', lh: 1.7,
    frame: '#E95420', bar: '#300A24',
    palette: { bg: '#300A24', fg: '#FFFFFF', green: '#4E9A06', neon: '#8AE234', cyan: '#34E2E2', pink: '#AD7FA8', yellow: '#FCE94F', red: '#F93632', blue: '#729FCF', dim: '#838383', hl: '#00ff9c', sug: '#3d6b55', orange: '#E95420' },
    swatches: ['#300A24', '#1B1B1B', '#CC1A12', '#4E9A06', '#C4A000', '#3667A6', '#7F5985', '#06989A', '#D5D5D5', '#F93632', '#8AE234', '#FCE94F', '#729FCF', '#AD7FA8', '#34E2E2', '#E95420'],
    lines: [
      [guyenTop(), c('dim', '22:41:07')],
      [c('green', '└─') + b('neon', '$') + ' ' + b('hl', 'nq') + ' ' + t('$IP')],
      [t('Starting Nmap 7.94 ( https://nmap.org )')],
      [b('fg', 'PORT   STATE SERVICE')],
      [t('22/tcp ') + c('neon', 'open') + t('  ssh')],
      [t('80/tcp ') + c('neon', 'open') + t('  http')],
      [''],
      [guyenTop(c('green', '─[') + c('yellow', '⧗ 4s') + c('green', ']')), c('dim', '22:41:12')],
      [c('green', '└─') + b('neon', '$') + ' ' + b('hl', 'listen') + cur + c('sug', ' 4444')],
    ],
    specs: [
      ['Emulador', 'Kitty · opacidad 0.97 · cursor en barra · borde activo naranja · logo como marca de agua'],
      ['Fuente', 'JetBrainsMono Nerd Font 12 pt · cero tachado (<code>+zero</code>) · altura de celda al 115 %'],
      ['Tema', 'Ubuntu / Tango: fondo berenjena <code>#300A24</code> y selección naranja <code>#E95420</code>'],
      ['Shell', 'zsh sin framework, atajos Emacs, historial de 100 000 líneas compartido'],
      ['Prompt', 'Starship de dos líneas: alias “Guyen”, IP de <code>tun0</code>, git, lenguajes, duración y hora'],
      ['Plugins', 'zsh-autosuggestions · zsh-syntax-highlighting (neón) · fzf + fd · zoxide · eza · bat · tmux'],
      ['Extras', 'Funciones para CTF (<code>box</code>, <code>listen</code>, <code>myip</code>, <code>b64e</code>, <code>nfull</code>) · <code>Esc Esc</code> antepone sudo'],
    ],
    install: `sudo apt install kitty zsh tmux fzf fd-find bat eza zoxide \\
  zsh-autosuggestions zsh-syntax-highlighting
ln -s "$(which fdfind)" ~/.local/bin/fd      # en Ubuntu fd se llama fdfind
curl -sS https://starship.rs/install.sh | sh

# JetBrainsMono Nerd Font
mkdir -p ~/.local/share/fonts && cd ~/.local/share/fonts
curl -fLO https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.tar.xz
tar xf JetBrainsMono.tar.xz && rm JetBrainsMono.tar.xz && fc-cache -f

chsh -s "$(which zsh)"
# luego copia ~/.zshrc, ~/.config/starship.toml y ~/.config/kitty/kitty.conf`,
  },
  {
    id: 'p10k',
    name: 'Oh My Zsh + Powerlevel10k',
    vibes: ['powerline'],
    tag: 'zsh · Oh My Zsh · p10k',
    desc: 'La combinación más extendida de zsh. Oh My Zsh aporta cientos de plugins y Powerlevel10k, un prompt instantáneo que se configura con un asistente.',
    window: 'zsh — ~/proyectos/web',
    font: "'MesloLGS NF', 'DejaVu Sans Mono', monospace",
    palette: { bg: '#1c1c1c', fg: '#d0d0d0', dim: '#585858', green: '#5faf00', red: '#d75f5f', yellow: '#d7af00', blue: '#0087af' },
    swatches: ['#1c1c1c', '#3a3a3a', '#d75f5f', '#5faf00', '#d7af00', '#0087af', '#af87d7', '#5fafaf', '#d0d0d0'],
    lines: [
      [p10kTop(), p10kRight('14:02:33')],
      [c('dim', '╰─') + b('green', '❯') + ' ' + t('git status -s'), c('dim', '─╯')],
      [c('red', ' M') + t(' src/App.tsx')],
      [c('red', '??') + t(' notes.md')],
      [''],
      [p10kTop(), p10kRight('14:02:35')],
      [c('dim', '╰─') + b('green', '❯') + ' ' + cur, c('dim', '─╯')],
    ],
    specs: [
      ['Emulador', 'Cualquiera: GNOME Terminal, Kitty, iTerm2…'],
      ['Fuente', 'MesloLGS NF, la recomendada por Powerlevel10k'],
      ['Tema', 'El del emulador. p10k define sus propios colores de segmento'],
      ['Shell', 'zsh + Oh My Zsh'],
      ['Prompt', 'Powerlevel10k, estilo rainbow, dos líneas con marco y prompt instantáneo'],
      ['Plugins', '<code>git</code> por defecto y más de 300 opcionales en <code>plugins=(…)</code>'],
    ],
    install: `sudo apt install zsh git curl
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \\
  "\${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
sed -i 's|^ZSH_THEME=.*|ZSH_THEME="powerlevel10k/powerlevel10k"|' ~/.zshrc

# Fuente: MesloLGS NF → github.com/romkatv/powerlevel10k#fonts
exec zsh          # arranca el asistente (p10k configure)`,
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin Mocha + Starship',
    vibes: ['powerline', 'pastel'],
    tag: 'Kitty/WezTerm · Starship',
    desc: 'Estética pastel, muy presente en el mundo de los dotfiles. Starship trae un preset oficial con la misma paleta.',
    window: 'kitty — ~/dotfiles',
    font: "'FiraCode Nerd Font', 'Fira Code', monospace",
    ff: '"calt" 1, "liga" 1',
    palette: { bg: '#1e1e2e', fg: '#cdd6f4', red: '#f38ba8', peach: '#fab387', yellow: '#f9e2af', green: '#a6e3a1', blue: '#89b4fa', lavender: '#b4befe', mauve: '#cba6f7', crust: '#11111b', overlay: '#6c7086' },
    swatches: ['#1e1e2e', '#313244', '#f38ba8', '#fab387', '#f9e2af', '#a6e3a1', '#94e2d5', '#74c7ec', '#89b4fa', '#b4befe', '#cba6f7', '#cdd6f4'],
    lines: [
      [catTop('18:20')],
      [b('green', '❯') + ' ' + c('green', 'eza') + ' ' + t('--icons')],
      [b('blue', '▸ .config') + t('  ') + b('blue', '▸ scripts') + t('  ') + c('mauve', '◆ install.sh') + t('  ') + c('peach', '◇ README.md')],
      [''],
      [catTop('18:21')],
      [b('green', '❯') + ' ' + cur],
    ],
    specs: [
      ['Emulador', 'Kitty o WezTerm, los dos con el tema Catppuccin integrado'],
      ['Fuente', 'FiraCode Nerd Font con ligaduras (<code>=&gt;</code> <code>!=</code> <code>-&gt;</code>)'],
      ['Tema', 'Catppuccin Mocha (variantes: Latte, Frappé y Macchiato)'],
      ['Shell', 'zsh, bash o fish: Starship funciona igual en todas'],
      ['Prompt', 'Starship, preset <code>catppuccin-powerline</code>'],
      ['Plugins', 'eza y bat con su tema Catppuccin para que todo combine'],
    ],
    install: `curl -sS https://starship.rs/install.sh | sh
starship preset catppuccin-powerline -o ~/.config/starship.toml   # Starship reciente
echo 'eval "$(starship init zsh)"' >> ~/.zshrc

# Tema en Kitty
kitty +kitten themes --reload-in=all Catppuccin-Mocha
# …o en WezTerm (~/.wezterm.lua): config.color_scheme = 'Catppuccin Mocha'

# Fuente: FiraCode Nerd Font (mismo método que JetBrainsMono, cambiando el .tar.xz)`,
  },
  {
    id: 'fish',
    name: 'Fish + Tokyo Night + Ghostty',
    vibes: ['minimal'],
    tag: 'Ghostty · fish · Tide',
    desc: 'Fish trae de serie las autosugerencias y el resaltado de sintaxis. Ghostty es un emulador acelerado por GPU y Tokyo Night le da el tono azul noche.',
    window: 'ghostty — ~/dev/api',
    font: "'JetBrains Mono', monospace",
    cw: '.6em',
    palette: { bg: '#1a1b26', fg: '#c0caf5', red: '#f7768e', green: '#9ece6a', yellow: '#e0af68', blue: '#7aa2f7', magenta: '#bb9af7', cyan: '#7dcfff', comment: '#565f89' },
    swatches: ['#1a1b26', '#24283b', '#414868', '#f7768e', '#ff9e64', '#e0af68', '#9ece6a', '#7dcfff', '#7aa2f7', '#bb9af7', '#c0caf5'],
    lines: [
      [b('blue', '~/dev/api') + ' ' + c('green', '⎇ main ⇡1'), c('yellow', 'took 3s') + ' ' + c('red', 'rs 1.80') + ' ' + c('comment', '12:04:21')],
      [b('green', '❯') + ' ' + c('cyan', 'cargo') + ' ' + t('test')],
      [t('running 12 tests')],
      [c('green', 'test result: ok.') + t(' 12 passed; 0 failed')],
      [''],
      [b('blue', '~/dev/api') + ' ' + c('green', '⎇ main ⇡1'), c('red', 'rs 1.80') + ' ' + c('comment', '12:04:25')],
      [b('green', '❯') + ' ' + c('cyan', 'git') + cur + c('comment', ' push origin main')],
    ],
    specs: [
      ['Emulador', 'Ghostty: acelerado por GPU, nativo en GTK y con cientos de temas incluidos'],
      ['Fuente', 'JetBrains Mono, que Ghostty trae integrada'],
      ['Tema', 'Tokyo Night'],
      ['Shell', 'fish, con autosugerencias, resaltado y completado sin plugins'],
      ['Prompt', 'Tide v6: asíncrono y configurable con <code>tide configure</code>'],
      ['Plugins', 'Fisher como gestor de plugins'],
    ],
    install: `sudo apt install fish
sudo snap install ghostty --classic
chsh -s "$(which fish)"

# dentro de fish:
curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source \\
  && fisher install jorgebucaran/fisher
fisher install IlanCosman/tide@v6
tide configure

# Tema: mira el nombre exacto y ponlo en ~/.config/ghostty/config
ghostty +list-themes | grep -i tokyo
# theme = <nombre que aparezca>`,
  },
  {
    id: 'kali',
    name: 'Kali · estilo pentesting',
    vibes: ['hacker'],
    tag: 'QTerminal · zsh',
    desc: 'El prompt de dos líneas con ㉿ que Kali trae por defecto. Es el antecesor directo del estilo h4ck3r.',
    window: 'qterminal — ~/htb/lame',
    font: "'Fira Code', monospace",
    cw: '.6em',
    palette: { bg: '#23252e', fg: '#ffffff', green: '#2fbf71', blue: '#3b8eea', red: '#e5534b', dim: '#6c7086' },
    swatches: ['#23252e', '#2fbf71', '#3b8eea', '#e5534b', '#d7ba7d', '#c586c0', '#ffffff'],
    lines: [
      [kaliTop()],
      [c('green', '└─') + b('blue', '$') + ' ' + c('green', 'sudo') + ' ' + c('green', 'openvpn') + ' ' + t('lab.ovpn')],
      [t('2026-10-14 22:10:03 Initialization Sequence Completed')],
      [''],
      [kaliTop()],
      [c('green', '└─') + b('blue', '$') + ' ' + cur],
    ],
    specs: [
      ['Emulador', 'QTerminal'],
      ['Fuente', 'Fira Code'],
      ['Tema', 'Kali-Dark'],
      ['Shell', 'zsh, la shell por defecto desde Kali 2020.4'],
      ['Prompt', 'Dos líneas <code>┌──(user㉿host)-[dir]</code> / <code>└─$</code>. Pasa a rojo si eres root'],
      ['Plugins', 'zsh-autosuggestions y zsh-syntax-highlighting, preinstalados'],
    ],
    install: `# En Kali ya viene así. En Ubuntu/Debian:
sudo apt install zsh qterminal fonts-firacode \\
  zsh-autosuggestions zsh-syntax-highlighting

# añade a ~/.zshrc el prompt de Kali (simplificado):
PROMPT=$'%F{green}┌──(%B%F{blue}%n㉿%m%b%F{green})-[%B%F{reset}%~%b%F{green}]\\n└─%B%F{blue}$%b%F{reset} '`,
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox · Alacritty + tmux',
    vibes: ['retro', 'powerline'],
    tag: 'Alacritty · tmux · Starship',
    desc: 'Tonos tierra con contraste cálido. Alacritty se encarga de pintar rápido y tmux gestiona ventanas, paneles y sesiones que siguen vivas aunque cierres la terminal.',
    window: 'Alacritty',
    font: "'Iosevka Term', 'IBM Plex Mono', monospace",
    cw: '.6em',
    palette: { bg: '#282828', fg: '#ebdbb2', bg0: '#282828', bg1: '#3c3836', bg2: '#504945', red: '#fb4934', green: '#b8bb26', yellow: '#fabd2f', blue: '#83a598', purple: '#d3869b', aqua: '#8ec07c', orange: '#fe8019', gray: '#928374',
      'tmux-bg': '#3c3836', 'tmux-fg': '#a89984', 'tmux-on': '#fabd2f', 'tmux-on-fg': '#282828' },
    swatches: ['#282828', '#3c3836', '#fb4934', '#b8bb26', '#fabd2f', '#83a598', '#d3869b', '#8ec07c', '#fe8019', '#ebdbb2'],
    lines: [
      [gruvTop('09:12')],
      [b('green', '❯') + ' ' + c('green', 'tmux') + ' ' + t('ls')],
      [t('dev: 3 windows (created Tue Oct 14 09:02:11 2026) ') + c('gray', '(attached)')],
      [''],
      [gruvTop('09:13')],
      [b('green', '❯') + ' ' + cur],
    ],
    status: [`<span class="on"> [dev] </span> 0:nvim  <span class="on"> 1:zsh* </span>  2:git-`, `"guyen" 09:13 14-oct-26 `],
    specs: [
      ['Emulador', 'Alacritty: minimalista, acelerado por GPU y configurado en TOML'],
      ['Fuente', 'Iosevka Term, estrecha y con mucha densidad de texto'],
      ['Tema', 'Gruvbox Dark, con fondo <code>#282828</code> y acentos naranja y mostaza'],
      ['Shell', 'zsh dentro de tmux: sesiones persistentes y paneles divididos'],
      ['Prompt', 'Starship, preset <code>gruvbox-rainbow</code>'],
      ['Plugins', 'tmux con prefijo <code>Ctrl b</code>, barra de estado inferior y Neovim con el mismo tema'],
    ],
    install: `sudo apt install alacritty tmux zsh

# Temas oficiales de Alacritty
mkdir -p ~/.config/alacritty/themes
git clone https://github.com/alacritty/alacritty-theme ~/.config/alacritty/themes
cat >> ~/.config/alacritty/alacritty.toml <<'EOF'
[general]
import = ["~/.config/alacritty/themes/themes/gruvbox_dark.toml"]
EOF

curl -sS https://starship.rs/install.sh | sh
starship preset gruvbox-rainbow -o ~/.config/starship.toml
echo 'eval "$(starship init zsh)"' >> ~/.zshrc`,
  },
  {
    id: 'dracula',
    name: 'Dracula + Pure',
    vibes: ['minimal'],
    tag: 'GNOME Terminal · zsh · Pure',
    desc: 'El prompt más limpio: solo la ruta, la rama y una flecha. Pure ocupa dos líneas y muestra lo demás (duración, cambios sin guardar) únicamente cuando importa.',
    window: 'guyen@ubuntu: ~/proyectos/api',
    chrome: 'gnome',
    font: "'Hack', 'Source Code Pro', monospace",
    palette: { bg: '#282a36', fg: '#f8f8f2', comment: '#6272a4', cyan: '#8be9fd', green: '#50fa7b', orange: '#ffb86c', pink: '#ff79c6', purple: '#bd93f9', red: '#ff5555', yellow: '#f1fa8c' },
    bar: '#21222c',
    swatches: ['#282a36', '#44475a', '#6272a4', '#ff5555', '#ffb86c', '#f1fa8c', '#50fa7b', '#8be9fd', '#bd93f9', '#ff79c6', '#f8f8f2'],
    lines: [
      [pureTop()],
      [c('pink', '❯') + ' ' + c('green', 'npm') + ' ' + t('run dev')],
      [''],
      [t('  ') + b('green', 'VITE v6.0.0') + t('  ready in ') + b('fg', '312') + t(' ms')],
      [t('  ') + c('green', '➜') + t('  ') + b('fg', 'Local:') + t('   ') + c('cyan', 'http://localhost:5173/')],
      [''],
      [pureTop('42s')],
      [c('pink', '❯') + ' ' + cur],
    ],
    specs: [
      ['Emulador', 'GNOME Terminal (o Ptyxis), con perfil Dracula'],
      ['Fuente', 'Hack, diseñada para leer código'],
      ['Tema', 'Dracula: fondo <code>#282a36</code> y acentos rosa, morado y cian'],
      ['Shell', 'zsh sin framework'],
      ['Prompt', 'Pure: dos líneas, git asíncrono y la duración solo si el comando tarda más de 5 s'],
      ['Plugins', 'Ninguno obligatorio. La idea es el minimalismo'],
    ],
    install: `sudo apt install zsh git dconf-cli fonts-hack

# Tema Dracula para GNOME Terminal
git clone https://github.com/dracula/gnome-terminal ~/.dracula-gnome
cd ~/.dracula-gnome && ./install.sh

# Prompt Pure
mkdir -p ~/.zsh && git clone https://github.com/sindresorhus/pure.git ~/.zsh/pure
cat >> ~/.zshrc <<'EOF'
fpath+=($HOME/.zsh/pure)
autoload -U promptinit; promptinit
prompt pure
EOF`,
  },
  {
    id: 'rosepine',
    name: 'Rosé Pine · WezTerm + Nushell',
    vibes: ['pastel', 'minimal'],
    tag: 'WezTerm · Nushell',
    desc: 'Nushell trata los datos como tablas en lugar de texto plano: ls, ps o un JSON salen ordenados y se pueden filtrar con where. Rosé Pine le pone tonos rosa y pino suaves.',
    window: 'wezterm — nu',
    font: "'Victor Mono', monospace",
    lh: 1.22,
    palette: { bg: '#191724', fg: '#e0def4', mute: '#6e6a86', subtle: '#908caa', love: '#eb6f92', gold: '#f6c177', rose: '#ebbcba', pine: '#31748f', foam: '#9ccfd8', iris: '#c4a7e7' },
    bar: '#1f1d2e',
    swatches: ['#191724', '#1f1d2e', '#26233a', '#6e6a86', '#eb6f92', '#f6c177', '#ebbcba', '#31748f', '#9ccfd8', '#c4a7e7', '#e0def4'],
    lines: [
      [b('foam', '~/dev/nu') + c('subtle', '> ') + c('iris', 'ls'), it('mute', '14/10/26 09:12:33')],
      [c('mute', '╭───┬────────────┬──────┬─────────╮')],
      [c('mute', '│') + b('pine', ' # ') + c('mute', '│') + b('foam', '    name    ') + c('mute', '│') + b('foam', ' type ') + c('mute', '│') + b('foam', '  size   ') + c('mute', '│')],
      [c('mute', '├───┼────────────┼──────┼─────────┤')],
      [c('mute', '│') + c('pine', ' 0 ') + c('mute', '│') + t(' README.md  ') + c('mute', '│') + t(' file ') + c('mute', '│') + c('gold', '  1.2 KB ') + c('mute', '│')],
      [c('mute', '│') + c('pine', ' 1 ') + c('mute', '│') + c('rose', ' src        ') + c('mute', '│') + t(' dir  ') + c('mute', '│') + c('gold', '  4.0 KB ') + c('mute', '│')],
      [c('mute', '│') + c('pine', ' 2 ') + c('mute', '│') + t(' Cargo.toml ') + c('mute', '│') + t(' file ') + c('mute', '│') + c('gold', '   842 B ') + c('mute', '│')],
      [c('mute', '╰───┴────────────┴──────┴─────────╯')],
      [b('foam', '~/dev/nu') + c('subtle', '> ') + cur],
    ],
    specs: [
      ['Emulador', 'WezTerm: configurable en Lua, con multiplexor propio y más de 200 temas'],
      ['Fuente', 'Victor Mono, con cursivas manuscritas en los comentarios'],
      ['Tema', 'Rosé Pine (también existen Moon y Dawn)'],
      ['Shell', 'Nushell: pipelines de datos estructurados (<code>ls | where size &gt; 1kb</code>)'],
      ['Prompt', 'El de Nushell por defecto: ruta, indicador <code>&gt;</code> y fecha a la derecha'],
      ['Plugins', 'Comandos integrados para JSON, CSV, YAML y HTTP, sin instalar nada aparte'],
    ],
    install: `# WezTerm (repositorio oficial)
curl -fsSL https://apt.fury.io/wez/gpg.key | sudo gpg --yes --dearmor -o /usr/share/keyrings/wezterm-fury.gpg
echo 'deb [signed-by=/usr/share/keyrings/wezterm-fury.gpg] https://apt.fury.io/wez/ * *' | sudo tee /etc/apt/sources.list.d/wezterm.list
sudo apt update && sudo apt install wezterm

# Nushell (con Homebrew, que ya tienes)
brew install nushell

cat > ~/.wezterm.lua <<'EOF'
local wezterm = require 'wezterm'
local config = wezterm.config_builder()
config.color_scheme = 'rose-pine'
config.font = wezterm.font 'Victor Mono'
config.default_prog = { 'nu' }
return config
EOF`,
  },
  {
    id: 'omp',
    name: 'Windows Terminal + Oh My Posh',
    vibes: ['powerline'],
    tag: 'Windows Terminal · PowerShell',
    desc: 'La versión de Windows: PowerShell 7 dentro de Windows Terminal y Oh My Posh, un motor de prompts multiplataforma que también funciona en zsh y bash.',
    window: 'PowerShell',
    chrome: 'win',
    font: "'Cascadia Code', 'Cascadia Mono', 'Source Code Pro', monospace",
    ff: '"calt" 1',
    palette: { bg: '#0c0c0c', fg: '#cccccc', blue: '#3b78ff', cyan: '#61d6d6', green: '#16c60c', yellow: '#f9f1a5', gold: '#c19c00', red: '#e74856', gray: '#767676' },
    bar: '#202020',
    swatches: ['#0c0c0c', '#c50f1f', '#13a10e', '#c19c00', '#0037da', '#881798', '#3a96dd', '#cccccc', '#767676', '#e74856', '#16c60c', '#f9f1a5', '#3b78ff', '#b4009e', '#61d6d6', '#f2f2f2'],
    lines: [
      [ompTop() + ' ' + c('gold', 'Get-ChildItem')],
      [''],
      [t('    Directory: C:\\repos\\web')],
      [''],
      [c('green', 'Mode                 LastWriteTime         Length Name')],
      [c('green', '----                 -------------         ------ ----')],
      [t('d----          14/10/2026     9:12                ') + b('blue', 'src')],
      [t('-a---          14/10/2026     9:10            842 package.json')],
      [''],
      [ompTop() + ' ' + cur],
    ],
    specs: [
      ['Emulador', 'Windows Terminal: pestañas, paneles, GPU y perfiles para PowerShell, CMD y WSL'],
      ['Fuente', 'Cascadia Code, la fuente de Windows Terminal, con ligaduras'],
      ['Tema', 'Campbell, el esquema por defecto (incluye One Half Dark, Solarized…)'],
      ['Shell', 'PowerShell 7 con PSReadLine (predicciones y resaltado)'],
      ['Prompt', 'Oh My Posh, tema <code>jandedobbeleer</code>, con segmentos en forma de diamante'],
      ['Plugins', 'Terminal-Icons, Oh My Posh y, opcionalmente, z para saltar entre carpetas'],
    ],
    install: `# PowerShell (Windows 11 ya trae Windows Terminal)
winget install Microsoft.PowerShell
winget install JanDeDobbeleer.OhMyPosh -s winget
oh-my-posh font install meslo

# añade a tu perfil (notepad $PROFILE):
oh-my-posh init pwsh --config 'https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/jandedobbeleer.omp.json' | Invoke-Expression

# Linux/macOS: curl -s https://ohmyposh.dev/install.sh | bash -s`,
  },
];
