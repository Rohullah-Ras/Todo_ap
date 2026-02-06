<template>
  <div class="card">
    <h2>User</h2>

    <div class="avatar">
      <div class="circle">RR</div>
      <div>
        <div class="name">Rohullah Rasooli</div>
        <div class="email">rohullah@email.com</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #1f2836;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px;
}

h2 {
  margin-bottom: 14px;
}

.avatar {
  display: flex;
  align-items: center;
  gap: 14px;
}

.circle {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #f59e0b;
  color: #111827;
  display: grid;
  place-items: center;
  font-weight: 900;
}

.name {
  font-weight: 800;
}

.email {
  font-size: 13px;
  opacity: 0.75;
}
</style>
