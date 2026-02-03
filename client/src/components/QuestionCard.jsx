import React from 'react'


function QuestionCard({ question }) {
  return (
    <div className="card">
      <div className="card-content">
        <h3>{question.question}</h3>
        <p>{question.answer}</p>
      </div>
      <div className="card-footer">
        {question.categoryRef ? (
          <span className="category-tag">{question.categoryRef.name}</span>
        ) : (
          <span className="category-tag no-category">Нет категории</span>
        )}
        <span className="date">{new Date(question.createdAt).toLocaleDateString('ru-RU')}</span>
      </div>
    </div>
  )
}

export default QuestionCard