# Next.js & HeroUI Template

This is a template for creating applications using Next.js 14 (app directory) and HeroUI (v2).

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/heroui/next-app-template)

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)

## How to Use

### Use the template with create-next-app

To create a new project based on this template using `create-next-app`, run the following command:

```bash
npx create-next-app -e https://github.com/heroui-inc/next-app-template
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).

## Git

This project is now a Git repository. Common commands:
- git status — show changes
- git add -A && git commit -m "message" — commit changes
- git remote add origin <your-repo-url> — set remote
- git push -u origin main — push the main branch

## Run this app locally (install Next.js and dependencies)

Follow these simple steps to run the project on your machine:

1. Prerequisites
   - Install Node.js LTS (v18 or newer recommended). Download from https://nodejs.org/
   - npm comes with Node.js. (Alternatively you can use pnpm, yarn, or bun.)
   - Optional: Install Git to clone the repository: https://git-scm.com/

2. Get the source code
   - Using Git:
     - git clone <your-repo-url>
     - cd <project-folder>
   - Or download the code as a ZIP and extract it, then open the folder in your terminal.

3. Install dependencies
   - Using npm (recommended if unsure):
     - npm install
   - Or with another manager:
     - pnpm install
     - yarn install
     - bun install

4. Start the development server
   - npm run dev
   - Then open http://localhost:3000 in your browser.

5. Optional: Using pnpm? Add this to your .npmrc
   - Some HeroUI packages need to be publicly hoisted when using pnpm. Add this to a .npmrc file in the project root, then run pnpm install again:
     - public-hoist-pattern[]=*@heroui/*

6. Build for production (optional)
   - npm run build
   - npm run start  (runs the built app)

Notes
- You do not need to install Next.js globally. It is already listed as a project dependency and will be installed by the package manager.
- If port 3000 is busy, set PORT=xxxx before the command (Windows PowerShell: $env:PORT=4000; npm run dev).