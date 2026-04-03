<template>
  <div class="termos-page">
    <div class="termos-card card">
      <div class="termos-header">
        <router-link to="/" class="btn-voltar">← Voltar</router-link>
        <div class="logo">😂 <span>FunnyApp</span></div>
      </div>

      <h1>Política de Privacidade</h1>
      <p class="data-atualizacao">Última atualização: {{ dataAtual }}</p>

      <div class="secao">
        <h2>1. Quais dados coletamos</h2>
        <p>Coletamos os seguintes dados quando você usa o FunnyApp:</p>
        <ul>
          <li><strong>Dados de cadastro:</strong> nome de usuário, email e senha (armazenada de forma criptografada)</li>
          <li><strong>Conteúdo publicado:</strong> imagens, legendas, tags e comentários</li>
          <li><strong>Interações:</strong> curtidas, seguidores, seguindo</li>
          <li><strong>Bio do perfil:</strong> texto opcional que você escreve</li>
        </ul>
      </div>

      <div class="secao">
        <h2>2. Como usamos seus dados</h2>
        <ul>
          <li>Para criar e gerenciar sua conta</li>
          <li>Para exibir seu conteúdo no feed</li>
          <li>Para enviar emails de confirmação e recuperação de senha</li>
          <li>Para moderação e segurança da plataforma</li>
        </ul>
      </div>

      <div class="secao">
        <h2>3. Onde seus dados ficam armazenados</h2>
        <ul>
          <li><strong>Dados da conta e posts:</strong> MongoDB Atlas (servidores em nuvem)</li>
          <li><strong>Imagens:</strong> Cloudinary (serviço de armazenamento de mídia)</li>
        </ul>
      </div>

      <div class="secao">
        <h2>4. Compartilhamento de dados</h2>
        <p>Não vendemos nem compartilhamos seus dados pessoais com terceiros, exceto quando exigido por lei ou para operação do serviço (como os provedores de armazenamento citados acima).</p>
      </div>

      <div class="secao">
        <h2>5. Seus direitos (LGPD)</h2>
        <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
        <ul>
          <li>Acessar seus dados pessoais</li>
          <li>Corrigir dados incorretos</li>
          <li>Solicitar a exclusão da sua conta e dados</li>
          <li>Revogar consentimento a qualquer momento</li>
        </ul>
      </div>

      <div class="secao">
        <h2>6. Segurança</h2>
        <p>Adotamos medidas de segurança como criptografia de senhas, tokens JWT e comunicação segura para proteger seus dados.</p>
      </div>

      <div class="secao">
        <h2>7. Cookies</h2>
        <p>O FunnyApp usa armazenamento local (localStorage) no seu navegador apenas para manter sua sessão de login ativa. Não usamos cookies de rastreamento ou publicidade.</p>
      </div>

      <div class="secao">
        <h2>8. Menores de idade</h2>
        <p>O FunnyApp não é destinado a menores de 13 anos. Se identificarmos uma conta de menor de idade, ela poderá ser removida.</p>
      </div>

      <div class="secao">
        <h2>9. Alterações nesta política</h2>
        <p>Podemos atualizar esta política periodicamente. Notificaremos os usuários sobre mudanças significativas por email.</p>
      </div>

      <div class="secao">
        <h2>10. Contato</h2>
        <p>Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato: <a href="mailto:funnyapp.noreply@gmail.com">funnyapp.noreply@gmail.com</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
</script>

<style scoped>
.termos-page { max-width: 720px; margin: 0 auto; padding: 32px 16px; }
.termos-card { padding: 40px; }
.termos-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.btn-voltar { color: var(--cinza-400); text-decoration: none; font-size: 0.88rem; transition: color var(--transition); }
.btn-voltar:hover { color: var(--branco); }
.logo { font-size: 1.3rem; font-weight: 700; display: flex; align-items: center; gap: 8px; }
.logo span { font-family: var(--fonte-titulo); color: var(--amarelo); }
h1 { font-family: var(--fonte-titulo); font-size: 1.8rem; margin-bottom: 6px; }
.data-atualizacao { font-size: 0.82rem; color: var(--cinza-400); margin-bottom: 32px; }
.secao { margin-bottom: 28px; }
.secao h2 { font-size: 1rem; font-weight: 600; margin-bottom: 10px; color: var(--amarelo); }
.secao p { color: var(--cinza-200); font-size: 0.9rem; line-height: 1.7; }
.secao ul { padding-left: 20px; margin-top: 8px; display: flex; flex-direction: column; gap: 6px; }
.secao ul li { color: var(--cinza-200); font-size: 0.9rem; line-height: 1.6; }
.secao a { color: var(--amarelo); }
</style>
