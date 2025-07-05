<template>
  <main>{{ page }}</main>
  <h1>Login</h1>
  <div>
    <label for="username">Username:</label>
    <input v-model="loginForm.Account" type="text" />
  </div>
  <div>
    <label for="password">Password:</label>
    <input v-model="loginForm.Password" type="password" />
  </div>
  <button type="submit" @click="handleLogin(loginForm)">Login</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from './composables';

const { loginForm, handleLogin } = useAuth();

const page = ref('home');
</script>
