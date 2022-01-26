# Schmarket

## Table of Contents
* Objective
* Architecture Overview
* * DB Schema
* * Backend application
* * Frontend application
* Tools Used
* Installation

## Objective
Create an application accodring to the [requirements](requirements.docx)

## Architecture Overview

### DB Schema

![DB Schema](db-schema.png)

### Backend Application

### Frontend Application

## Tools used

- [dbdiagram.io](https://dbdiagram.io/d) - data modeling
- [Prisma](https://www.prisma.io/) - ORM and data modeling
- [Synth](https://www.getsynth.com/) - Data generator
- [generatedata.com](https://generatedata.com/generator) - Long text data generator
- [Express](https://expressjs.com/) - Node.js server/router framework (used for prototyping)
- [Next.js](https://nextjs.org/) - Frontend rendering framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework 

## Installation

```bash
mkdir data
docker compose up -d
npm install -D
npx prisma generate
npx prisma migrate dev
npx prisma migrate reset
npm run dev
```
