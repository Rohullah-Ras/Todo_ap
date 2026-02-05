<script>
export default {
  name: "Header"
}
</script>

<template>
  <header class="topbar">
    <div class="brand">Task Manager</div>

    <div class="search">
      <input v-model="search" class="searchInput" placeholder="Search"/>
    </div>

    <button class="createBtn" @click="createTask">Creat Task</button>

    <nav class="topLinks">
      <a class="topLink" href="#">Link four</a>
      <a class="topLink" href="#">Link three</a>
    </nav>

    <div class="topIcons">
      <button class="iconBtn" title="Help">?</button>
      <button class="iconBtn" title="Settings">⚙</button>
      <button class="iconBtn" title="Account">👤</button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  background: #1a2230;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 14px;
}

.brand {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.search {
  flex: 1;
  max-width: 520px;
}

.searchInput {
  width: 100%;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #111827;
  color: #e9eef7;
  padding: 0 10px;
  outline: none;
}

.createBtn {
  height: 34px;
  padding: 0 14px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #1e8e3e;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.topLinks {
  display: flex;
  gap: 16px;
  margin-left: 6px;
}

.topLink {
  color: rgba(233, 238, 247, 0.85);
  text-decoration: none;
  font-size: 13px;
}

.topIcons {
  display: flex;
  gap: 10px;
  margin-left: 6px;
}

.iconBtn {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #111827;
  color: #e9eef7;
  cursor: pointer;
}
</style>
