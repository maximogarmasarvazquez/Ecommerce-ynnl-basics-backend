# 🛒 Ecommerce Backend API

Este es el backend de un sistema de ecommerce desarrollado con **Node.js**, **Express** y **Prisma ORM**, usando **PostgreSQL** como base de datos. Provee endpoints RESTful para gestionar usuarios, productos, categorías, pedidos, descuentos y direcciones de envío.

## 🚀 Tecnologías utilizadas

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Dotenv
- CORS
- UUID
- Bcrypt (para el hash de contraseñas, si se agrega)
- JWT (para autenticación futura)

## 📦 Estructura del Proyecto

/backend
├── prisma/
│ ├── schema.prisma
├── src/
│ ├── controllers/
│ ├── routes/
│ ├── services/
│ └── index.js
├── .env
├── package.json
└── README.md


## 🧑‍💻 Instalación y uso

1. Cloná este repositorio:

git clone https://github.com/tuusuario/ecommerce-backend.git
cd ecommerce-backend

## Instalá dependencias:
npm install

## Configurá tu archivo .env:
env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/EcommerceDatabase"
PORT=5000

## Ejecutá las migraciones de Prisma:
npx prisma migrate reset
o si no querés resetear, podés usar:
npx prisma migrate dev

## Levantá el servidor:
npm run dev

✍️ Desarrollado por
Maximo Garmasar Vázquez 
 [Linkedin](https://www.linkedin.com/in/maximogarmasarvazquez) [Github](https://github.com/maximogarmasarvazquez)

## 📚 Documentacion
- [Documentacion del proyecto](https://docs.google.com/document/d/1v_b9NjidGaJwqzRaKyLRcYdcMo9waeXTa1sUHmAzWgk/edit?usp=sharing)