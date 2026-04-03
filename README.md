# 😂 FunnyApp — Compartilhe o que é engraçado

Rede social de imagens estilo iFunny com feed público, curtidas, comentários e sistema de seguidores.

## Funcionalidades

- Feed público de imagens (sem precisar de login)
- Cadastro e login com JWT
- Upload de imagens via Cloudinary
- Curtidas e comentários
- Seguir/deixar de seguir usuários
- Feed personalizado (posts de quem você segue)
- Trending (posts mais curtidos)
- Busca de usuários
- Perfil com grid de posts
- Tags clicáveis para filtrar conteúdo

## Tecnologias

- **Frontend:** Vue 3, Pinia, Vue Router, Vite, Axios
- **Backend:** Node.js, Express, Mongoose
- **Banco:** MongoDB (Atlas)
- **Imagens:** Cloudinary
- **Auth:** JWT + bcryptjs

## Instalação

### 1. Cloudinary (grátis)
1. Crie conta em cloudinary.com
2. No dashboard copie: Cloud Name, API Key, API Secret

### 2. Backend
```bash
cd backend
npm install
copy .env.example .env
# Edite o .env com suas credenciais
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173

## Variáveis de ambiente (backend/.env)

```env
PORT=3000
MONGODB_URI=sua_connection_string_mongodb
JWT_SECRET=sua_chave_secreta
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
FRONTEND_URL=http://localhost:5173
```

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| POST | /api/usuarios/registro | Criar conta |
| POST | /api/usuarios/login | Login |
| GET | /api/usuarios/:username | Perfil do usuário |
| POST | /api/usuarios/:id/seguir | Seguir/desseguir |
| GET | /api/posts | Feed público |
| GET | /api/posts/trending | Posts mais curtidos |
| GET | /api/posts/seguindo | Feed de seguidos |
| POST | /api/posts | Criar post (com imagem) |
| DELETE | /api/posts/:id | Deletar post |
| POST | /api/posts/:id/curtir | Curtir/descurtir |
| POST | /api/posts/:id/comentarios | Comentar |
