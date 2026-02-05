// Practice Test Application

// Render printable test grid
function renderPrintableTest(containerId, questions) {
    const container = document.getElementById(containerId);
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    let html = '';
    questions.forEach((q, index) => {
        let optionsHtml = '';
        let answerHtml = '';
        
        if (q.type === 'free') {
            // Free response - just a line to write on
            optionsHtml = `
                <div class="answer-label">Output:</div>
                <div class="answer-line"></div>
            `;
            answerHtml = q.answer;
        } else if (q.type === 'code') {
            // Write code - multiple lines
            const lineCount = q.lines || 3;
            optionsHtml = `
                <div class="answer-label">Write your code:</div>
                <div class="answer-lines">
                    ${Array(lineCount).fill('<div class="answer-line"></div>').join('')}
                </div>
            `;
            answerHtml = `<pre>${q.answer}</pre>`;
        } else {
            // Multiple choice
            const correctLetter = optionLabels[q.correctAnswer];
            optionsHtml = `
                <div class="q-options">
                    ${q.options.map((opt, i) => `
                        <div class="q-option">
                            <div class="bubble"></div>
                            <span>${optionLabels[i]}. ${opt}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            answerHtml = `${correctLetter}. ${q.options[q.correctAnswer]}`;
        }
        
        html += `
            <div class="grid-question">
                <div class="q-number">${index + 1}.</div>
                <div class="q-text">${q.question}</div>
                ${optionsHtml}
                <button class="reveal-btn" onclick="revealAnswer(this)">Show Answer</button>
                <div class="answer-reveal">${answerHtml}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function revealAnswer(btn) {
    const answerDiv = btn.nextElementSibling;
    if (answerDiv.classList.contains('show')) {
        answerDiv.classList.remove('show');
        btn.textContent = 'Show Answer';
    } else {
        answerDiv.classList.add('show');
        btn.textContent = 'Hide Answer';
    }
}

class PracticeTest {
    constructor(testName, questions) {
        this.testName = testName;
        this.questions = questions;
        this.currentQuestion = 0;
        this.answers = new Array(questions.length).fill(null);
        this.submitted = false;
        
        this.init();
    }
    
    init() {
        this.renderQuestion();
        this.updateProgress();
        this.updateNavButtons();
    }
    
    renderQuestion() {
        const question = this.questions[this.currentQuestion];
        const questionCard = document.getElementById('question-card');
        
        let optionsHTML = question.options.map((option, index) => {
            const isSelected = this.answers[this.currentQuestion] === index;
            const selectedClass = isSelected ? 'selected' : '';
            
            let resultClass = '';
            if (this.submitted) {
                if (index === question.correctAnswer) {
                    resultClass = 'correct';
                } else if (isSelected && index !== question.correctAnswer) {
                    resultClass = 'incorrect';
                }
            }
            
            return `
                <div class="option ${selectedClass} ${resultClass}" onclick="test.selectOption(${index})">
                    <input type="radio" name="answer" id="option${index}" 
                           ${isSelected ? 'checked' : ''} 
                           ${this.submitted ? 'disabled' : ''}>
                    <label for="option${index}">${option}</label>
                </div>
            `;
        }).join('');
        
        questionCard.innerHTML = `
            <div class="question-number">Question ${this.currentQuestion + 1} of ${this.questions.length}</div>
            <div class="question-text">${question.question}</div>
            <div class="options">${optionsHTML}</div>
        `;
    }
    
    selectOption(index) {
        if (this.submitted) return;
        
        this.answers[this.currentQuestion] = index;
        this.renderQuestion();
        this.updateNavButtons();
    }
    
    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
    }
    
    updateNavButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        
        prevBtn.disabled = this.currentQuestion === 0;
        
        if (this.currentQuestion === this.questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
            
            const allAnswered = this.answers.every(a => a !== null);
            submitBtn.disabled = !allAnswered || this.submitted;
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }
    
    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderQuestion();
            this.updateProgress();
            this.updateNavButtons();
        }
    }
    
    nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
            this.renderQuestion();
            this.updateProgress();
            this.updateNavButtons();
        }
    }
    
    submit() {
        if (this.submitted) return;
        
        this.submitted = true;
        this.showResults();
    }
    
    showResults() {
        let correctCount = 0;
        this.questions.forEach((q, i) => {
            if (this.answers[i] === q.correctAnswer) {
                correctCount++;
            }
        });
        
        const percentage = Math.round((correctCount / this.questions.length) * 100);
        const testContent = document.getElementById('test-content');
        
        let message = '';
        if (percentage >= 90) {
            message = 'Excellent work! 🎉';
        } else if (percentage >= 70) {
            message = 'Good job! Keep practicing! 👍';
        } else if (percentage >= 50) {
            message = 'Not bad, but there\'s room for improvement. 📚';
        } else {
            message = 'Keep studying and try again! 💪';
        }
        
        testContent.innerHTML = `
            <div class="results">
                <h2>Test Complete!</h2>
                <div class="score">${percentage}%</div>
                <p class="score-text">You got ${correctCount} out of ${this.questions.length} questions correct.</p>
                <p class="score-text">${message}</p>
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="test.reviewAnswers()">Review Answers</button>
                    <a href="../index.html" class="btn btn-secondary">Back to Tests</a>
                    <button class="btn btn-secondary" onclick="location.reload()">Try Again</button>
                </div>
            </div>
        `;
    }
    
    reviewAnswers() {
        const testContent = document.getElementById('test-content');
        
        let reviewHTML = `
            <div class="review-header">
                <h2>Answer Review</h2>
                <div class="result-actions" style="margin-bottom: 2rem;">
                    <a href="../index.html" class="btn btn-secondary">Back to Tests</a>
                    <button class="btn btn-secondary" onclick="location.reload()">Try Again</button>
                </div>
            </div>
        `;
        
        this.questions.forEach((q, i) => {
            const userAnswer = this.answers[i];
            const isCorrect = userAnswer === q.correctAnswer;
            
            reviewHTML += `
                <div class="question-card" style="border-left: 4px solid ${isCorrect ? '#27ae60' : '#e74c3c'};">
                    <div class="question-number">Question ${i + 1} ${isCorrect ? '✓' : '✗'}</div>
                    <div class="question-text">${q.question}</div>
                    <div class="options">
                        ${q.options.map((opt, optI) => {
                            let classes = 'option';
                            if (optI === q.correctAnswer) classes += ' correct';
                            else if (optI === userAnswer && optI !== q.correctAnswer) classes += ' incorrect';
                            return `<div class="${classes}" style="cursor: default;"><label>${opt}</label></div>`;
                        }).join('')}
                    </div>
                </div>
            `;
        });
        
        testContent.innerHTML = reviewHTML;
    }
}

// Question Banks
const deepLearningQuestions = [
    { 
        type: "free",
        question: `Compute the matrix-vector product:<br><br>$$\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 5 \\\\ 6 \\end{bmatrix}$$`, 
        answer: "$\\begin{bmatrix} 17 \\\\ 39 \\end{bmatrix}$"
    },
    { 
        type: "free",
        question: `Compute the product:<br><br>$$\\begin{bmatrix} 2 & 3 \\end{bmatrix} \\begin{bmatrix} 4 \\\\ 5 \\end{bmatrix}$$`, 
        answer: "$23$"
    },
    { 
        type: "free",
        question: `Given predictions $\\hat{Y}$ and actual values $Y$:<br><br>$$\\hat{Y} = \\begin{bmatrix} 2 \\\\ 4 \\\\ 6 \\end{bmatrix}, \\quad Y = \\begin{bmatrix} 1 \\\\ 5 \\\\ 4 \\end{bmatrix}$$<br>Compute the Mean Squared Error (MSE) loss.`, 
        answer: "$2$"
    },
    { 
        type: "free",
        question: `A single-input neural network has weight $w = 2$ and bias $b = 1$. Given input:<br><br>$$X = \\begin{bmatrix} 1 \\\\ 2 \\\\ 3 \\end{bmatrix}$$<br>Compute the output $\\hat{Y}$.`, 
        answer: "$\\begin{bmatrix} 3 \\\\ 5 \\\\ 7 \\end{bmatrix}$"
    },
    { 
        type: "free",
        question: `A feedforward neural network receives the following input matrix $X$:<br><br>$$X = \\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\\\ 7 & 8 & 9 \\\\ 10 & 11 & 12 \\end{bmatrix}$$<br>How many inputs does this neural network have?`, 
        answer: "$3$"
    },
    { 
        type: "free",
        question: `A feedforward neural network has 1 output and receives the following input matrix $X$:<br><br>$$X = \\begin{bmatrix} 1 & 2 & 3 & 4 \\\\ 5 & 6 & 7 & 8 \\\\ 9 & 10 & 11 & 12 \\end{bmatrix}$$<br>What is the shape of the output $\\hat{Y}$?`, 
        answer: "$(3, 1)$"
    },
    { 
        type: "code",
        question: `Complete the following PyTorch program to compute and print the loss:<pre>import torch

X = torch.tensor([
    [2.0],
    [5.0]
])

Y = torch.tensor([
    [5.0],
    [1.0]
])

w = torch.tensor([
    [3.0]
])

b = torch.tensor([
    [1.0]
])

# Your code here:</pre>`,
        answer: `Yhat = X@w + b

r = Yhat - Y
SSE = r.T@r
loss = SSE/2
print(loss)`,
        lines: 6
    },
    { 
        type: "code",
        question: `Write a PyTorch program that defines a tensor, computes the cube of the tensor, and prints the derivative at that point.`,
        answer: `import torch

x = torch.tensor([
    [5.0]
],requires_grad = True)
f = x**3
f.backward()
print(x.grad)`,
        lines: 8
    },
    { 
        type: "code",
        question: `Write a PyTorch program that defines two tensors, computes a function of both variables, and prints the partial derivatives.`,
        answer: `import torch

x = torch.tensor([
    [2.0]
],requires_grad = True)
y = torch.tensor([
    [3.0]
],requires_grad = True)
f = x**2 + y**2
f.backward()
print(x.grad)
print(y.grad)`,
        lines: 12
    },
    { 
        type: "free",
        question: `Compute the Hadamard product (element-wise product):<br><br>$$\\begin{bmatrix} 2 & 3 \\\\ 4 & 5 \\end{bmatrix} \\odot \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$$`, 
        answer: "$\\begin{bmatrix} 2 & 6 \\\\ 12 & 20 \\end{bmatrix}$"
    }
];

const databaseQuestions = [
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    { question: "", options: ["", "", "", ""], correctAnswer: 0 }
];

const programmingQuestions = [
    { 
        type: "free",
        question: `What is the output of the following code?<pre>fruits = ["apple", "banana", "cherry"]
print(fruits[1])</pre>`, 
        answer: "banana"
    },
    { 
        type: "free",
        question: `What is the output of the following code?<pre>colors = ["red", "green"]
colors.append("blue")
print(colors)</pre>`, 
        answer: "['red', 'green', 'blue']"
    },
    { 
        type: "code",
        question: `Write a function called <code>poly</code> that takes a number <code>x</code> as input and returns the value of:<br><br><span class="math">f(x) = x<sup>3</sup> + 5x<sup>2</sup> + 7</span>`,
        answer: `def poly(x):
    return x**3 + 5*x**2 + 7`,
        lines: 3
    },
    { 
        type: "code",
        question: `Write a function called <code>welcome</code> that takes a <code>name</code> as input and returns the string <code>"Welcome to Python, [name]!"</code> where <code>[name]</code> is replaced with the actual name.<br><br>Example: <code>welcome("Bob")</code> should return <code>"Welcome to Python, Bob!"</code>`,
        answer: `def welcome(name):
    return f"Welcome to Python, {name}!"`,
        lines: 3
    },
    { 
        type: "code",
        question: `Write a function called <code>introduce</code> that takes two strings, <code>name</code> and <code>city</code>, and returns the string <code>"My name is [name] and I am from [city]."</code><br><br>Example: <code>introduce("Sara", "Denver")</code> should return <code>"My name is Sara and I am from Denver."</code>`,
        answer: `def introduce(name, city):
    return f"My name is {name} and I am from {city}."`,
        lines: 3
    },
    { 
        type: "code",
        question: `Write a function called <code>sum_and_product</code> that takes two numbers <code>a</code> and <code>b</code> as input and returns a tuple containing their sum and their product.<br><br>Example: <code>sum_and_product(3, 4)</code> should return <code>(7, 12)</code>`,
        answer: `def sum_and_product(a, b):
    return (a + b, a * b)`,
        lines: 3
    },
    { 
        type: "free",
        question: `You have a Python file called <code>my_program.py</code>. What command do you type in the terminal to run this program?`,
        answer: "python my_program.py"
    },
    { 
        type: "code",
        question: `Write a function called <code>wave</code> that takes a number <code>x</code> as input and returns the value of:<br><br><span class="math">f(x) = sin(x) + cos(2x)</span><br><br>Include any necessary imports.`,
        answer: `import math

def wave(x):
    return math.sin(x) + math.cos(2*x)`,
        lines: 4
    },
    { 
        type: "free",
        question: `What is the output of the following code?<pre>x = 8
y = x * 3 - 4
print(y)</pre>`,
        answer: "20"
    },
    { 
        type: "code",
        question: `Write a function called <code>full_name</code> that takes three strings: <code>first</code>, <code>nickname</code>, and <code>last</code>. It returns the full name with the nickname in double quotes.<br><br>Example: <code>print(full_name("Dwayne", "The Rock", "Johnson"))</code> prints:<br><code>Dwayne "The Rock" Johnson</code>`,
        answer: `def full_name(first, nickname, last):
    return f'{first} "{nickname}" {last}'`,
        lines: 3
    }
];
