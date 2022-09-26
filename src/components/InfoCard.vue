
<template>
  <div id="card-wrapper" class="card">
    <h3>Infos</h3>
  </div>
</template>

<script>
export default {
  name: "InfoCard"
}
</script>

<style scoped>
.card {
  box-shadow: 4px 4px 8px 4px rgba(0, 0, 0, 0.2);
  transition: 0.3s;
}

.container {
  padding: 2px 16px;
}

#card-wrapper {
  z-index: 999;
  background: white;
  height: auto;
  width: 20%;
  position: fixed;
  margin: 10% 0 0 0 ;
}
</style>