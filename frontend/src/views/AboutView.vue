<template>
  <div class="about-page">
    <div class="container">
      <header class="page-header">
        <h1>О нашем новостном портале</h1>
        <p>Узнайте больше о нашей миссии и команде</p>
      </header>

      <main class="about-content">
        <section class="mission-section">
          <div class="mission-card">
            <div class="mission-icon">🎯</div>
            <h2>Наша миссия</h2>
            <p>
              Мы стремимся предоставлять самые актуальные и достоверные новости 
              из различных сфер жизни. Наша цель - информировать, вдохновлять 
              и объединять людей через качественный контент.
            </p>
          </div>
        </section>

        <section class="features-section">
          <h2>Что мы предлагаем</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📰</div>
              <h3>Свежие новости</h3>
              <p>Ежедневно обновляемая лента самых важных событий</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">🔍</div>
              <h3>Глубокий анализ</h3>
              <p>Экспертные мнения и детальный разбор событий</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">🌟</div>
              <h3>Качественный контент</h3>
              <p>Только проверенная информация от надежных источников</p>
            </div>
          </div>
        </section>

        <section class="team-section">
          <h2>Наша команда</h2>
          <div class="team-grid">
            <div class="team-member">
              <div class="member-avatar">👨‍💼</div>
              <h3>Главный редактор</h3>
              <p>Обеспечивает качество и достоверность публикуемых материалов</p>
            </div>
            
            <div class="team-member">
              <div class="member-avatar">👩‍💻</div>
              <h3>Журналисты</h3>
              <p>Профессионалы, которые собирают и анализируют информацию</p>
            </div>
            
            <div class="team-member">
              <div class="member-avatar">👨‍🎨</div>
              <h3>Дизайнеры</h3>
              <p>Создают удобный и привлекательный интерфейс для читателей</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  padding: 80px 0 60px;
  color: white;
}

.page-header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.page-header p {
  font-size: 1.3rem;
  opacity: 0.9;
  font-weight: 300;
}

.about-content {
  background: white;
  border-radius: 30px 30px 0 0;
  margin-top: -30px;
  position: relative;
  padding: 60px 0;
}

.mission-section {
  padding: 0 0 60px;
}

.mission-card {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.mission-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.mission-card h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
}

.mission-card p {
  font-size: 1.2rem;
  line-height: 1.7;
  color: #666;
}

.features-section {
  padding: 60px 0;
  background: #f8f9fa;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
}

.features-section h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 50px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 15px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.team-section {
  padding: 60px 0 0;
}

.team-section h2 {
  text-align: center;
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 50px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 900px;
  margin: 0 auto;
}

.team-member {
  text-align: center;
  padding: 30px 20px;
}

.member-avatar {
  font-size: 3rem;
  margin-bottom: 20px;
}

.team-member h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 15px;
}

.team-member p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header p {
    font-size: 1.1rem;
  }
  
  .mission-card h2,
  .features-section h2,
  .team-section h2 {
    font-size: 2rem;
  }
  
  .mission-card p {
    font-size: 1.1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 60px 0 40px;
  }
  
  .about-content {
    padding: 40px 0;
  }
  
  .mission-card,
  .feature-card {
    padding: 30px 20px;
  }
}
</style>