# Play & Win

A multi-game platform for winning coins and XP rewards.

## Games

- **Wheel of Fortune** - Spin the wheel for a chance to win prizes!
- **Memory Match** - Coming soon
- **Lucky Slots** - Coming soon
- **Scratch Cards** - Coming soon

## Project Structure

```
├── app/
│   ├── page.tsx          # Game launcher (home)
│   ├── wheel/            # Wheel of Fortune game
│   ├── admin/            # CMS for managing prizes
│   └── api/              # API routes
├── components/
│   ├── games/
│   │   └── wheel/        # Wheel-specific components
│   ├── launcher/         # Game launcher components
│   ├── shared/           # Shared components (AuthModal, etc.)
│   └── ui/               # Base UI components
├── contexts/             # React contexts (Auth)
├── lib/                  # Utilities, types, config
└── supabase/
    └── migrations/       # Database migrations
```

## Getting Started

```bash
npm install --legacy-peer-deps
npm run dev
```

## Environment Variables

See `.env.example` for required environment variables.
