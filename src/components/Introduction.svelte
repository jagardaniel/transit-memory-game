<script lang="ts">
  import { hasSeenIntro } from "../lib/localStorage";

  function dismissIntro() {
    hasSeenIntro.set(true);
  }
</script>

<div class="intro-overlay" onclick={dismissIntro}>
  <div class="intro-content">
    <h2>Gissa stationer!</h2>
    <p>
      Försöka gissa namnet på så många stationer som möjligt. Skriv in ett namn på en station i fältet ovanför och tryck på enter för att gissa. Rött
      betyder att stationen inte finns eller är felstavad och gult innebär att stationen redan har gissats korrekt. Lycka till!
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

  /* Mobile */
  @media (max-width: 768px) {
    .intro-content {
      padding: 15px;
      width: 80%;
    }

    .intro-content h2 {
      font-size: 1.4rem;
    }

    .intro-content p {
      font-size: 0.95rem;
    }

    .hint {
      font-size: 0.8rem;
    }
  }
</style>
