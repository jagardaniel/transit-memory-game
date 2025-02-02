<script lang="ts">
  import { hasSeenIntro } from "../lib/stores";

  function dismissIntro() {
    hasSeenIntro.set(true);
  }
</script>

<div class="intro-overlay" onclick={dismissIntro}>
  <div class="intro-content">
    <h2>Gissa stationer!</h2>
    <p>
      Spelet går ut på att försöka gissa namnet på alla stationer. Skriv in ett namn på en station i fältet ovanför och tryck på enter för att gissa.
      Rött betyder att stationen inte finns och gult att stationen redan har gissats korrekt. Lycka till!
    </p>
    <p class="hint">(Klicka för att fortsätta)</p>
  </div>
</div>

<style>
  .intro-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    transition: opacity 0.5s ease-in-out;
  }

  .intro-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    max-width: 600px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    animation: fadeIn 0.5s ease-in-out;
  }

  .intro-content h2 {
    margin-bottom: 10px;
  }

  .hint {
    font-style: italic;
    margin-top: 10px;
    color: gray;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
