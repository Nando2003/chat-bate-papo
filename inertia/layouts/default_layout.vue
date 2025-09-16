<template>
  <AppHeader />
  <Toast />
  <slot />
</template>

<script lang="ts" setup>
import Toast from '../components/toast.vue'
import AppHeader from '../components/header.vue'
</script>
