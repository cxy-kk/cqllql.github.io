    const gameState = {
      locations: {
        forest: { visited: false, treasureFound: false },
        cave: { visited: false, treasureFound: false },
        castle: { visited: false, treasureFound: false },
        beach: { visited: false, treasureFound: false },
        temple: { visited: false, treasureFound: false },
        island: { visited: false, treasureFound: false }
      },
      currentLocation: null,
      musicEnabled: true,
      load() {
        const saved = localStorage.getItem('treasureHuntState');
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.assign(this, parsed);
        }
        this.updateUI();
      },
      save() {
        localStorage.setItem('treasureHuntState', JSON.stringify(this));
      },
      visitLocation(location) {
        this.locations[location].visited = true;
        this.currentLocation = location;
        this.save();
        this.updateUI();
      },
      findTreasure(location) {
        this.locations[location].treasureFound = true;
        this.save();
        this.updateUI();
      },
      getTreasureCount() {
        return Object.values(this.locations).filter(loc => loc.treasureFound).length;
      },
      getVisitedCount() {
        return Object.values(this.locations).filter(loc => loc.visited).length -
               (this.locations.island.visited ? 1 : 0); // 排除最终岛屿
      },
      getAllTreasuresFound() {
        return this.getTreasureCount() === 5;
      },
      updateUI() {
        // 更新进度条
        const progress = (this.getVisitedCount() / 5) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('exploredCount').textContent = this.getVisitedCount();
        document.getElementById('foundTreasures').textContent = this.getTreasureCount();
        document.getElementById('treasureCount').textContent = this.getTreasureCount();

        // 更新宝藏列表
        Object.keys(this.locations).forEach(loc => {
          if (loc !== 'island') {
            const item = document.querySelector(`.treasure-item[data-treasure="${loc}"]`);
            if (this.locations[loc].treasureFound) {
              item.classList.remove('opacity-50', 'border-gray-700');
              item.classList.add('opacity-100', 'border-primary');
            }
          }
        });

        // 检查是否所有宝藏都已找到，显示最终岛屿
        if (this.getAllTreasuresFound() && !this.locations.island.visited) {
          document.getElementById('finalIslandMarker').classList.remove('hidden');
        }

        // 更新音乐按钮状态
        const musicIcon = document.querySelector('#musicToggle i');
        if (this.musicEnabled) {
          musicIcon.className = 'fa fa-volume-up text-xl';
        } else {
          musicIcon.className = 'fa fa-volume-off text-xl';
        }
      },
      reset() {
        this.locations = {
          forest: { visited: false, treasureFound: false },
          cave: { visited: false, treasureFound: false },
          castle: { visited: false, treasureFound: false },
          beach: { visited: false, treasureFound: false },
          temple: { visited: false, treasureFound: false },
          island: { visited: false, treasureFound: false }
        };
        this.currentLocation = null;
        this.save();
        this.updateUI();
      }
    };

    // 音频管理
    const audioManager = {
      currentMusic: null,
      sounds: {},

      init() {
        // 预加载所有音频
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
          this.sounds[audio.id] = audio;
        });
      },

      playMusic(id) {
        if (!gameState.musicEnabled) return;

        // 停止当前播放的音乐
        if (this.currentMusic && this.currentMusic !== this.sounds[id]) {
          this.currentMusic.pause();
          this.currentMusic.currentTime = 0;
        }

        this.currentMusic = this.sounds[id];
        this.currentMusic.volume = 0.5;
        this.currentMusic.play().catch(e => console.log('音频播放失败:', e));
      },

      stopMusic() {
        if (this.currentMusic) {
          this.currentMusic.pause();
          this.currentMusic.currentTime = 0;
          this.currentMusic = null;
        }
      },

      playSound(id) {
        if (!gameState.musicEnabled) return;

        const sound = this.sounds[id];
        if (sound) {
          sound.currentTime = 0;
          sound.volume = 0.7;
          sound.play().catch(e => console.log('音效播放失败:', e));
        }
      },

      toggleMusic() {
        gameState.musicEnabled = !gameState.musicEnabled;
        gameState.save();
        gameState.updateUI();

        if (gameState.musicEnabled) {
          if (gameState.currentLocation) {
            this.playMusic(`${gameState.currentLocation}Music`);
          } else {
            this.playMusic('mapMusic');
          }
        } else {
          this.stopMusic();
        }
      }
    };

    // 谜题处理
    const puzzles = {
      // 森林谜题 - 找出不属于森林的动物
      initForest() {
        const options = document.querySelectorAll('#forestPuzzle .puzzle-option');
        options.forEach(option => {
          option.addEventListener('click', async () => {
            audioManager.playSound('clickSound');

            // 添加点击效果
            option.classList.add('scale-95', 'opacity-70');
            await new Promise(resolve => setTimeout(resolve, 200));

            if (option.dataset.answer === 'fish') {
              // 正确答案
              document.getElementById('forestPuzzle').classList.add('hidden');
              document.getElementById('forestTreasure').classList.remove('hidden');
            } else {
              // 错误答案
              option.classList.add('bg-red-900/30');
              await new Promise(resolve => setTimeout(resolve, 1000));
              option.classList.remove('bg-red-900/30', 'scale-95', 'opacity-70');
            }
          });
        });
      },

      // 洞穴谜题 - 按顺序点击数字
      initCave() {
        const symbolsContainer = document.getElementById('caveSymbols');
        const hintElement = document.getElementById('caveHint');
        const numbers = [1, 2, 3, 4, 5];
        let shuffledNumbers = [...numbers].sort(() => Math.random() - 0.5);
        let selectedNumbers = [];

        // 生成数字符号
        shuffledNumbers.forEach(num => {
          const symbol = document.createElement('div');
          symbol.className = 'cave-symbol w-16 h-16 bg-gray-800/70 hover:bg-gray-800 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-all';
          symbol.textContent = num;
          symbol.dataset.number = num;
          symbolsContainer.appendChild(symbol);

          symbol.addEventListener('click', async () => {
            if (selectedNumbers.includes(num)) return;

            audioManager.playSound('clickSound');
            symbol.classList.add('scale-95', 'bg-primary/50');

            selectedNumbers.push(num);

            // 检查是否按顺序选择
            if (selectedNumbers.length === numbers.length) {
              if (JSON.stringify(selectedNumbers) === JSON.stringify(numbers)) {
                // 正确
                await new Promise(resolve => setTimeout(resolve, 500));
                document.getElementById('cavePuzzle').classList.add('hidden');
                document.getElementById('caveTreasure').classList.remove('hidden');
              } else {
                // 错误
                await new Promise(resolve => setTimeout(resolve, 1000));
                selectedNumbers = [];
                document.querySelectorAll('.cave-symbol').forEach(s => {
                  s.classList.remove('scale-95', 'bg-primary/50');
                });
                hintElement.classList.remove('hidden');
              }
            }
          });
        });
      },

      // 城堡谜题 - 猜年份
      initCastle() {
        const digits = document.querySelectorAll('.castle-digit');
        const submitBtn = document.getElementById('castleSubmit');
        const correctCode = [1, 4, 9, 2]; // 正确答案：1492

        // 数字输入处理
        digits.forEach((digit, index) => {
          digit.addEventListener('input', (e) => {
            if (e.target.value) {
              // 限制为单个数字
              e.target.value = e.target.value.slice(-1);
              // 自动跳到下一个输入框
              if (index < digits.length - 1) {
                digits[index + 1].focus();
              }
            }
          });

          // 允许通过上下箭头改变数字
          digit.addEventListener('wheel', (e) => {
            e.preventDefault();
            let value = parseInt(digit.value) || 0;
            if (e.deltaY < 0) {
              value = (value + 1) % 10;
            } else {
              value = (value - 1 + 10) % 10;
            }
            digit.value = value;
          });
        });

        // 提交按钮
        submitBtn.addEventListener('click', async () => {
          audioManager.playSound('clickSound');
          submitBtn.classList.add('scale-95');

          // 获取输入的代码
          const enteredCode = Array.from(digits).map(d => parseInt(d.value) || 0);

          await new Promise(resolve => setTimeout(resolve, 300));
          submitBtn.classList.remove('scale-95');

          if (JSON.stringify(enteredCode) === JSON.stringify(correctCode)) {
            // 正确
            document.getElementById('castlePuzzle').classList.add('hidden');
            document.getElementById('castleTreasure').classList.remove('hidden');
          } else {
            // 错误，抖动输入框
            digits.forEach(d => {
              d.classList.add('border-red-600');
              d.classList.add('animate-shake');
            });

            await new Promise(resolve => setTimeout(resolve, 500));
            digits.forEach(d => {
              d.classList.remove('border-red-600');
              d.classList.remove('animate-shake');
            });
          }
        });
      },

      // 海滩谜题 - 找到不同的贝壳
      initBeach() {
        const shellGrid = document.getElementById('shellGrid');
        const shellTypes = ['fa-seashell', 'fa-asterisk', 'fa-circle'];
        const gridSize = 9;
        const targetIndex = Math.floor(Math.random() * gridSize);
        const normalType = Math.floor(Math.random() * shellTypes.length);
        const targetType = (normalType + 1) % shellTypes.length;

        // 创建贝壳网格
        for (let i = 0; i < gridSize; i++) {
          const shell = document.createElement('div');
          const isTarget = i === targetIndex;
          const shellClass = isTarget ? shellTypes[targetType] : shellTypes[normalType];

          shell.className = `shell w-full aspect-square bg-blue-900/30 hover:bg-blue-900/60 rounded-lg flex items-center justify-center text-3xl cursor-pointer transition-all`;
          shell.innerHTML = `<i class="fa ${shellClass}"></i>`;
          shell.dataset.isTarget = isTarget;

          shellGrid.appendChild(shell);

          shell.addEventListener('click', async () => {
            audioManager.playSound('clickSound');
            shell.classList.add('scale-95');

            await new Promise(resolve => setTimeout(resolve, 300));

            if (isTarget) {
              // 找到目标贝壳
              document.getElementById('beachPuzzle').classList.add('hidden');
              document.getElementById('beachTreasure').classList.remove('hidden');
            } else {
              // 错误的贝壳
              shell.classList.add('bg-red-900/30');
              await new Promise(resolve => setTimeout(resolve, 800));
              shell.classList.remove('bg-red-900/30', 'scale-95');
            }
          });
        }
      },

      // 寺庙谜题 - 按顺序点击雕像
      initTemple() {
        const statuesContainer = document.getElementById('statues');
        const attemptsElement = document.getElementById('templeAttempts');
        const correctOrder = [1, 2, 3, 4];
        let statues = [...correctOrder];
        let currentOrder = [];
        let attempts = 0;

        // 随机打乱雕像顺序
        statues = statues.sort(() => Math.random() - 0.5);

        // 创建雕像
        statues.forEach((num, index) => {
          const statue = document.createElement('div');
          statue.className = 'statue w-20 h-32 bg-rose-900/30 hover:bg-rose-900/60 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all';
          statue.innerHTML = `<i class="fa fa-idol text-3xl mb-2"></i><span>${num}</span>`;
          statue.dataset.number = num;
          statue.dataset.index = index;

          statuesContainer.appendChild(statue);

          statue.addEventListener('click', async () => {
            // 已经点击过的雕像不能再次点击，直到序列完成或失败
            if (currentOrder.some(item => item.index === index)) return;

            audioManager.playSound('clickSound');
            statue.classList.add('scale-95', 'bg-primary/50');

            currentOrder.push({ number: num, index: index });

            // 检查是否完成序列
            if (currentOrder.length === correctOrder.length) {
              attempts++;
              attemptsElement.textContent = `尝试次数: ${attempts}`;

              // 检查是否正确
              const isCorrect = currentOrder.every((item, i) => item.number === correctOrder[i]);

              await new Promise(resolve => setTimeout(resolve, 800));

              if (isCorrect) {
                // 正确
                document.getElementById('templePuzzle').classList.add('hidden');
                document.getElementById('templeTreasure').classList.remove('hidden');
              } else {
                // 错误，重置
                currentOrder = [];
                document.querySelectorAll('.statue').forEach(s => {
                  s.classList.remove('scale-95', 'bg-primary/50');
                });
              }
            }
          });
        });
      }
    };

    // 页面导航
    const navigate = {
      toLocation(location) {
        return new Promise(async (resolve) => {
          // 保存状态
          gameState.visitLocation(location);

          // 隐藏地图页面，显示地点页面容器
          document.getElementById('mapPage').classList.add('hidden');
          document.getElementById('locationPages').classList.remove('hidden');

          // 隐藏所有地点页面
          document.querySelectorAll('.location-page').forEach(page => {
            page.classList.add('hidden');
          });

          // 显示目标地点页面
          const targetPage = document.getElementById(`${location}Page`);
          targetPage.classList.remove('hidden');

          // 播放对应背景音乐
          audioManager.playMusic(`${location}Music`);

          // 添加过渡动画
          targetPage.classList.add('animate-fadeIn');
          await new Promise(resolve => setTimeout(resolve, 500));
          targetPage.classList.remove('animate-fadeIn');

          // 如果宝藏已找到，直接显示宝藏
          if (gameState.locations[location].treasureFound) {
            document.querySelector(`#${location}Puzzle`).classList.add('hidden');
            document.querySelector(`#${location}Treasure`).classList.remove('hidden');
          } else {
            // 初始化对应地点的谜题
            if (typeof puzzles[`init${location.charAt(0).toUpperCase() + location.slice(1)}`] === 'function') {
              puzzles[`init${location.charAt(0).toUpperCase() + location.slice(1)}`]();
            }
          }

          resolve();
        });
      },

      toMap() {
        return new Promise(async (resolve) => {
          // 隐藏地点页面，显示地图页面
          document.getElementById('locationPages').classList.add('hidden');
          document.getElementById('mapPage').classList.remove('hidden');

          // 播放地图背景音乐
          audioManager.playMusic('mapMusic');

          // 重置当前位置
          gameState.currentLocation = null;
          gameState.save();

          await new Promise(resolve => setTimeout(resolve, 500));
          resolve();
        });
      }
    };

    // 初始化游戏
    async function initGame() {
      // 加载游戏状态
      gameState.load();

      // 初始化音频
      audioManager.init();

      // 播放地图音乐
      if (gameState.musicEnabled) {
        audioManager.playMusic('mapMusic');
      }

      // 地图标记点击事件
      document.querySelectorAll('[data-location]').forEach(marker => {
        marker.addEventListener('click', async () => {
          audioManager.playSound('clickSound');
          const location = marker.dataset.location;
          await navigate.toLocation(location);
        });
      });

      // 返回按钮点击事件
      document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          audioManager.playSound('clickSound');
          await navigate.toMap();
        });
      });

      // 收集宝藏按钮点击事件
      document.querySelectorAll('.collect-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          audioManager.playSound('successSound');
          const location = gameState.currentLocation;

          // 标记宝藏为已找到
          gameState.findTreasure(location);

          // 添加收集动画
          btn.classList.add('scale-95');
          await new Promise(resolve => setTimeout(resolve, 300));

          // 返回地图
          await navigate.toMap();
        });
      });

      // 音乐开关
      document.getElementById('musicToggle').addEventListener('click', () => {
        audioManager.toggleMusic();
      });

      // 宝藏 inventory
      document.getElementById('inventoryBtn').addEventListener('click', () => {
        audioManager.playSound('clickSound');
        document.getElementById('inventory').classList.remove('hidden');
      });

      document.getElementById('closeInventory').addEventListener('click', () => {
        audioManager.playSound('clickSound');
        document.getElementById('inventory').classList.remove('hidden');
        document.getElementById('inventory').classList.add('hidden');
      });

      // 重新开始游戏
      document.getElementById('restartGame').addEventListener('click', async () => {
        audioManager.playSound('clickSound');
        gameState.reset();

        // 重置所有谜题和宝藏显示
        document.querySelectorAll('.puzzle-container').forEach(puzzle => {
          puzzle.classList.remove('hidden');
        });
        document.querySelectorAll('[id$="Treasure"]').forEach(treasure => {
          treasure.classList.add('hidden');
        });

        await navigate.toMap();
      });

      // 隐藏加载屏幕
      setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('opacity-0', 'pointer-events-none');
        document.getElementById('loadingScreen').style.transition = 'opacity 0.5s ease';
        document.getElementById('gameContainer').classList.remove('hidden');
      }, 1500);
    }

    // 启动游戏
    window.addEventListener('DOMContentLoaded', initGame);
