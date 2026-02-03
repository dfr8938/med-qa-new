import React from 'react'


function QuestionItem({ question, onEdit, onDelete }) {
  // Получаем название категории из объекта categoryRef если он существует
  const categoryName = question.categoryRef?.name || question.category || 'Нет категории';
  
  return (
    <div className="question-item">
      <div className="question-content">
        <h4>{question.question}</h4>
        <p>{question.answer}</p>
      </div>
      <div className="question-footer">
        <div className="question-meta">
          <span className="date">{new Date(question.createdAt).toLocaleDateString('ru-RU')}</span>
          <span className={categoryName === 'Нет категории' ? 'category-tag no-category' : 'category-tag'}>
            {categoryName}
          </span>
        </div>
        <div className="question-actions">
          <button
            className="btn btn-edit"
            onClick={() => onEdit(question)}
            title="Редактировать"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDelete()}
            title="Удалить"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuestionItem