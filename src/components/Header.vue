<template>
    <header class="header p-5 m-0 bg-gray-900 flex">
        <Logo />
        <div>
            <h1 class="text-2xl ambaan-text text-white">Ambaan</h1>
            <p>Your friendly neighbourhood data viz tool</p>
        </div>
    </header>
</template>

<script>
import Logo from "./Logo.vue";
export default {
    name: "Header",
    components: { Logo }
}
</script>

<style>
.header {
    border-bottom: 1px solid grey;
}
.ambaan-text {
    font-family: "Yuji Mai", serif;
    font-weight: 400;
    font-style: normal;
}
</style>