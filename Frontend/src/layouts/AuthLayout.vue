<template>
  <v-app>
    <div class="auth-shell">
      <div class="auth-left">
        <div class="brand">
          <div class="brand-title">Task Manager</div>
          <div class="brand-sub">Organize. Plan. Deliver.</div>
        </div>
        <div class="floating-pill pill-1"/>
        <div class="floating-pill pill-2"/>
        <div class="floating-pill pill-3"/>
      </div>

      <div class="auth-right">
        <router-view/>
      </div>
    </div>
  </v-app>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  background: #eef1f6;
}

.auth-left {
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 20% 20%, #ffffff 0%, #eef1f6 55%, #e9edf5 100%);
}

.brand {
  padding: 28px 32px;
}

.brand-title {
  font-size: 22px;
  font-weight: 700;
  color: #1b1f2a;
}

.brand-sub {
  margin-top: 6px;
  color: #5e657a;
  font-size: 13px;
}

.floating-pill {
  position: absolute;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);
  filter: blur(0.2px);
}

.pill-1 {
  width: 240px;
  height: 46px;
  top: 90px;
  left: 80px;
}

.pill-2 {
  width: 140px;
  height: 38px;
  bottom: 160px;
  left: 140px;
}

.pill-3 {
  width: 210px;
  height: 42px;
  top: 270px;
  right: 120px;
  opacity: 0.75;
}

.auth-right {
  background: #2f3b52; /* donker paneel zoals screenshot */
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 28px;
}

@media (max-width: 960px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-left {
    display: none;
  }

  .auth-right {
    min-height: 100vh;
  }
}
</style>