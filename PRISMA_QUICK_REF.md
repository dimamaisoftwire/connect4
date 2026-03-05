# Prisma Quick Reference

## Setup

```bash
npm install
npm run db:migrate
```

## Common Operations

### Create

```typescript
const game = await prisma.game.create({
  data: {
    winner: 1,
    loser: 2,
    moveCount: 42,
  },
});
```

### Read One

```typescript
const game = await prisma.game.findUnique({
  where: { id: 1 },
});
```

### Read Many

```typescript
const games = await prisma.game.findMany({
  where: { winner: 1 },
  orderBy: { createdAt: "desc" },
  take: 10,
});
```

### Update

```typescript
const game = await prisma.game.update({
  where: { id: 1 },
  data: { winner: 2 },
});
```

### Delete

```typescript
await prisma.game.delete({
  where: { id: 1 },
});
```

### Count

```typescript
const count = await prisma.game.count({
  where: { winner: 1 },
});
```

## Commands

| Command               | Purpose                          |
| --------------------- | -------------------------------- |
| `npm run db:studio`   | Open database GUI                |
| `npm run db:migrate`  | Create schema migration          |
| `npm run db:push`     | Sync schema to database          |
| `npm run db:reset`    | Reset database (⚠️ deletes data) |
| `npx prisma validate` | Check schema validity            |
| `npx prisma format`   | Format schema                    |

## Schema Basics

```prisma
model Game {
  id        Int     @id @default(autoincrement())  // Primary key
  winner    Int                                      // Required field
  loser     Int?                                     // Optional field (?)
  createdAt DateTime @default(now())               // Auto timestamp

  @@index([winner])                                 // Index for faster queries
}
```

## Get Help

```bash
npx prisma --help
npx prisma migrate --help
npx prisma db --help
```

## Resources

- [SQL Queries](../queries.sql) - Raw SQL examples
- [Full Guide](PRISMA_GUIDE.md)
- [Setup Instructions](SETUP.md)
- [Prisma Docs](https://www.prisma.io/docs/)
