function gerarCPF() {
    const rand = () => Math.floor(Math.random() * 9);
    const mod11 = nums => {
      let soma = 0;
      for (let i = 0; i < nums.length; i++) {
        soma += nums[i] * ((nums.length + 1) - i);
      }
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };
  
    const base = Array.from({ length: 9 }, rand);
    base.push(mod11(base));
    base.push(mod11(base));
  
    return base.join('');
  }
  
  console.log(gerarCPF());  