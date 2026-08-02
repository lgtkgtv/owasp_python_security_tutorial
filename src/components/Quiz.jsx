import React, { useState } from 'react';
import { CheckCircle, Trophy, XCircle } from 'lucide-react';

const Quiz = ({ questions, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = () => {
    setShowResults(true);
    const allCorrect = questions.every(q => answers[q.id] === q.correct);
    if (allCorrect) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <div key={question.id} className="bg-slate-900 rounded-lg p-6">
          <h4 className="font-bold mb-4">
            {question.id}. {question.question}
          </h4>
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                  answers[question.id] === idx
                    ? 'bg-purple-600/30 border-2 border-purple-500'
                    : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                } ${
                  showResults && idx === question.correct
                    ? 'bg-green-600/30 border-green-500'
                    : showResults && answers[question.id] === idx && idx !== question.correct
                    ? 'bg-red-600/30 border-red-500'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[question.id] === idx}
                  onChange={() => setAnswers({ ...answers, [question.id]: idx })}
                  disabled={showResults}
                  className="mt-1"
                />
                <span className="flex-1">{option}</span>
                {showResults && idx === question.correct && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {showResults && answers[question.id] === idx && idx !== question.correct && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </label>
            ))}
          </div>
          {showResults && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Explanation:</strong> {question.explanation}
              </p>
            </div>
          )}
        </div>
      ))}

      {!showResults ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== questions.length}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg">
          <h4 className="font-bold text-xl mb-2 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Quiz Complete!
          </h4>
          <p>
            You scored {questions.filter(q => answers[q.id] === q.correct).length} out of {questions.length}
          </p>
          {questions.every(q => answers[q.id] === q.correct) && (
            <p className="mt-2 font-bold">🎉 Perfect score! You've mastered this topic!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
