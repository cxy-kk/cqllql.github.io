        // 模拟宝藏地图API
        class TreasureMap {
            static async getInitialClue() {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve("在古老的图书馆里找到了第一个线索：'钟楼指向东方，谜题藏在书架第三层'...");
                    }, 1000);
                });
            }

            static async solveRiddle(clue) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(`谜题解答：钟楼指向东方！谜底：'东方有光，书架第三层有暗格'`);
                    }, 1500);
                });
            }

            static async decodeAncientScript(clue) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (!clue) {
                            reject("没有线索可以解码!");
                        }
                        resolve("解码成功！宝藏坐标：神庙迷宫的'月光石'位置");
                    }, 1200);
                });
            }

            static async navigateForest() {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve("穿越神秘的森林迷宫，避开陷阱，找到了正确的路径！");
                    }, 1800);
                });
            }

            static async searchTemple(location) {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const random = Math.random();
                        if (random < 0.5) {
                            reject("需要解谜才能通过");
                        }
                        resolve("找到了一个神秘的箱子，箱盖上刻着'月光石'的符号");
                    }, 2200);
                });
            }

            static async openTreasureBox() {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve("恭喜！你找到了传说中的宝藏！");
                    }, 1000);
                });
            }
        }

        // 动画进度更新
        function updateProgress(percentage) {
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            if (progressFill) {
                progressFill.style.width = `${percentage}%`;
            }
            if (progressText) {
                progressText.textContent = `${Math.round(percentage)}%`;
            }
        }

        // 显示步骤
        function showStep(stepId) {
            const step = document.getElementById(stepId);
            if (step) {
                step.classList.add('active');
            }
        }

        // 隐藏步骤
        function hideStep(stepId) {
            const step = document.getElementById(stepId);
            if (step) {
                step.classList.remove('active');
            }
        }

        // 步骤内容动画
        async function animateStep(stepId, content) {
            const stepContent = document.getElementById(`${stepId}-content`);
            if (stepContent) {
                stepContent.textContent = content;
            }

            // 显示步骤
            showStep(stepId);

            // 模拟动画效果
            await new Promise(resolve => setTimeout(resolve, 300));

            // 更新进度
            const stepNumber = stepId.replace('step', '');
            updateProgress(stepNumber * 16.6);
        }

        // 显示解谜模态框
        function showRiddleModal() {
            const modal = document.getElementById('riddleModal');
            modal.style.display = 'flex';

            // 添加选项点击事件
            const options = document.querySelectorAll('.riddle-option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    const answer = option.getAttribute('data-answer');
                    checkRiddleAnswer(answer);
                });
            });

            // 关闭模态框
            const closeBtn = document.querySelector('.close');
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // 点击模态框外部关闭
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // 检查解谜答案
        function checkRiddleAnswer(answer) {
            const resultDiv = document.getElementById('riddleResult');
            const modal = document.getElementById('riddleModal');

            if (answer === 'B') {
                resultDiv.textContent = '正确！守卫放行了！';
                resultDiv.style.color = '#4caf50';
                // 关闭模态框
                modal.style.display = 'none';
                // 解决等待的Promise
                window.riddleResolve();
            } else {
                resultDiv.textContent = '错误！守卫不放行。请再试一次。';
                resultDiv.style.color = '#f44336';
            }
        }

        // 寻宝过程
        async function findTreasure() {
            try {
                // 步骤1: 获取初始线索
                const clue = await TreasureMap.getInitialClue();
                await animateStep('step1', clue);

                // 步骤2: 解开谜题
                const riddleAnswer = await TreasureMap.solveRiddle(clue);
                await animateStep('step2', riddleAnswer);

                // 步骤3: 解码古文
                const location = await TreasureMap.decodeAncientScript(riddleAnswer);
                await animateStep('step3', location);

                // 步骤4: 穿越森林迷宫
                const forestPath = await TreasureMap.navigateForest();
                await animateStep('step4', forestPath);

                // 步骤5: 寻找神庙
                try {
                    const box = await TreasureMap.searchTemple(location);
                    await animateStep('step5', box);
                } catch (error) {
                    if (error === "需要解谜才能通过") {
                        // 显示解谜模态框
                        showRiddleModal();

                        // 等待用户解谜
                        await new Promise(resolve => {
                            window.riddleResolve = resolve;
                        });

                        // 用户解谜成功，继续
                        const box = await TreasureMap.searchTemple(location);
                        await animateStep('step5', box);
                    } else {
                        throw error;
                    }
                }

                // 步骤6: 打开宝箱
                const treasure = await TreasureMap.openTreasureBox();
                await animateStep('step6', treasure);

                // 显示宝藏
                const treasureContent = document.getElementById('treasureContent');
                if (treasureContent) {
                    treasureContent.classList.add('show');
                }

                // 打开宝箱动画
                const treasureBox = document.getElementById('treasureBox');
                if (treasureBox) {
                    treasureBox.classList.add('open');
                }

                // 完成进度
                updateProgress(100);

                // 添加宝藏特效
                setTimeout(() => {
                    const treasureBox = document.getElementById('treasureBox');
                    if (treasureBox) {
                        treasureBox.style.animation = 'pulse 2s infinite';
                    }
                }, 500);

            } catch (error) {
                console.error("寻宝失败:", error);
                alert(`寻宝失败: ${error}`);

                // 显示失败提示
                const step5 = document.getElementById('step5');
                if (step5) {
                    step5.querySelector('.step-content').textContent = `失败: ${error}`;
                    step5.classList.add('active');
                }
            }
        }

        // 页面加载后初始化
        document.addEventListener('DOMContentLoaded', () => {
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    startBtn.disabled = true;
                    startBtn.textContent = "正在寻宝...";

                    // 重置进度
                    updateProgress(0);
                    const treasureBox = document.getElementById('treasureBox');
                    if (treasureBox) {
                        treasureBox.classList.remove('open');
                    }
                    const treasureContent = document.getElementById('treasureContent');
                    if (treasureContent) {
                        treasureContent.classList.remove('show');
                    }

                    // 开始寻宝
                    findTreasure();
                });
            }
        });