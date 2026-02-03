'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Проверяем, существуют ли уже данные в базе
    const existingCategories = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM "Categories"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingUsers = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM "Users"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const existingQuestions = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM "Questions"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Если данные уже существуют, пропускаем создание
    if (existingCategories[0].count > 0 || existingUsers[0].count > 0 || existingQuestions[0].count > 0) {
      console.log('Данные уже существуют в базе. Пропускаем создание сидов.');
      return;
    }
    
    // Создаем категории
    const categories = [
      {
        name: 'Профилактика',
        description: 'Вопросы о профилактике заболеваний и поддержании здоровья',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Вакцинация',
        description: 'Информация о вакцинах и прививках',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Питание',
        description: 'Вопросы о правильном питании и диетах',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Инфекционные болезни',
        description: 'Информация о вирусах, бактериях и инфекциях',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Кардиология',
        description: 'Вопросы о сердечно-сосудистой системе',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ортопедия',
        description: 'Информация о заболеваниях опорно-двигательного аппарата',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Онкология',
        description: 'Вопросы о онкологических заболеваниях',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Эндокринология',
        description: 'Вопросы по категории Эндокринология',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Пульмонология',
        description: 'Вопросы по категории Пульмонология',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Гастроэнтерология',
        description: 'Вопросы по категории Гастроэнтерология',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Неврология',
        description: 'Вопросы по категории Неврология',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Урология',
        description: 'Вопросы по категории Урология',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Гинекология',
        description: 'Вопросы по категории Гинекология',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Терапия',
        description: 'Вопросы по категории Терапия',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Дерматология',
        description: 'Вопросы о кожных заболеваниях, уходе за кожей и дерматологических процедурах',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Офтальмология',
        description: 'Информация о заболеваниях глаз, зрении и офтальмологических обследованиях',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Отоларингология',
        description: 'Вопросы о заболеваниях уха, горла, носа и ЛОР-органов',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Педиатрия',
        description: 'Информация о здоровье детей, возрастные особенности и детские заболевания',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Гериатрия',
        description: 'Вопросы о здоровье пожилых людей, возрастные изменения и уход',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Психиатрия',
        description: 'Информация о психических расстройствах, стрессе и психологическом здоровье',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await queryInterface.bulkInsert('Categories', categories, {});
    console.log('Категории успешно созданы');
    
    // Получаем ID созданных категорий
    const createdCategories = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Categories"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    // Создаем пользователей
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('superadmin123', salt);
    
    const users = [
      {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        role: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', salt),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Добавляем 10 дополнительных администраторов
    for (let i = 1; i <= 10; i++) {
      users.push({
        username: `admin${i}`,
        email: `admin${i}@example.com`,
        password: await bcrypt.hash(`admin${i}123`, salt),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await queryInterface.bulkInsert('Users', users, {});
    console.log('Пользователи успешно созданы');
    
    // Создаем вопросы
    const questions = [];
    
    // Добавляем 5 существующих карточек
    questions.push(
      {
        question: 'Как часто нужно проходить медицинский осмотр?',
        answer: 'Медицинский осмотр рекомендуется проходить ежегодно для взрослых и раз в полгода для пожилых людей.',
        categoryId: categoryMap['Профилактика'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Какие вакцины необходимы взрослым?',
        answer: 'Взрослым рекомендуются вакцины против гриппа, столбняка, дифтерии, пневмококковой инфекции и других заболеваний в зависимости от возраста и состояния здоровья.',
        categoryId: categoryMap['Вакцинация'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Как правильно питаться для поддержания здоровья?',
        answer: 'Правильное питание включает употребление овощей, фруктов, цельнозерновых продуктов, нежирных белков и ограничение сахара, соли и насыщенных жиров.',
        categoryId: categoryMap['Питание'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Какие симптомы указывают на развитие диабета?',
        answer: 'Основные симптомы диабета включают повышенную жажду, частое мочеиспускание, усталость, замедленное заживление ран и потерю веса. При появлении этих симптомов следует обратиться к врачу.',
        categoryId: categoryMap['Эндокринология'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Как предотвратить развитие остеохондроза?',
        answer: 'Для профилактики остеохондроза рекомендуется регулярно заниматься физическими упражнениями, поддерживать правильную осанку, избегать длительного нахождения в одной позе и использовать ортопедические средства при необходимости.',
        categoryId: categoryMap['Ортопедия'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
    
    // Добавляем 15 новых карточек по различным категориям
    const additionalQuestions = [
      {
        question: 'Какие меры предосторожности следует соблюдать при контакте с больным гриппом?',
        answer: 'Следует избегать близкого контакта с больным, часто мыть руки, использовать медицинскую маску и регулярно проветривать помещение.',
        categoryId: categoryMap['Инфекционные болезни'],
        createdAt: new Date('2026-01-14'),
        updatedAt: new Date('2026-01-14')
      },
      {
        question: 'Как правильно измерять артериальное давление в домашних условиях?',
        answer: 'Измерять давление следует в спокойной обстановке, сидя, после 5-минутного отдыха. Рука должна быть на уровне сердца, манжета плотно прилегать к плечу.',
        categoryId: categoryMap['Кардиология'],
        createdAt: new Date('2026-01-14'),
        updatedAt: new Date('2026-01-14')
      },
      {
        question: 'Какие продукты следует исключить из рациона при повышенном уровне холестерина?',
        answer: 'Следует ограничить потребление жирного мяса, яиц, сливочного масла, маргарина, фастфуда и продуктов с высоким содержанием насыщенных жиров.',
        categoryId: categoryMap['Питание'],
        createdAt: new Date('2026-01-14'),
        updatedAt: new Date('2026-01-14')
      },
      {
        question: 'Какие упражнения рекомендуются при остеохондрозе шейного отдела позвоночника?',
        answer: 'Рекомендуются плавание, йога, лечебная физкультура, упражнения на растяжку шеи и плечевого пояса, а также изометрические упражнения.',
        categoryId: categoryMap['Ортопедия'],
        createdAt: new Date('2026-01-14'),
        updatedAt: new Date('2026-01-14')
      },
      {
        question: 'Как часто следует проходить маммографию женщинам после 40 лет?',
        answer: 'Женщинам после 40 лет рекомендуется проходить маммографию ежегодно для раннего выявления рака молочной железы.',
        categoryId: categoryMap['Онкология'],
        createdAt: new Date('2026-01-14'),
        updatedAt: new Date('2026-01-14')
      },
      {
        question: 'Какие симптомы указывают на развитие анемии?',
        answer: 'Основные симптомы анемии включают слабость, головокружение, бледность кожи, одышку и учащенное сердцебиение.',
        categoryId: categoryMap['Профилактика'],
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-10')
      },
      {
        question: 'Какова рекомендуемая дозировка витамина D для взрослых?',
        answer: 'Рекомендуемая дозировка витамина D для взрослых составляет 600-800 МЕ в сутки, при дефиците может потребоваться более высокая доза по назначению врача.',
        categoryId: categoryMap['Вакцинация'],
        createdAt: new Date('2026-01-05'),
        updatedAt: new Date('2026-01-05')
      },
      {
        question: 'Какие осложнения могут возникнуть при нелеченом диабете?',
        answer: 'При нелеченом диабете могут развиться осложнения, такие как диабетическая кома, поражение почек, глаз, нервов и сердечно-сосудистой системы.',
        categoryId: categoryMap['Эндокринология'],
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01')
      },
      {
        question: 'Какие меры профилактики простудных заболеваний наиболее эффективны зимой?',
        answer: 'Эффективные меры профилактики включают закаливание, регулярное проветривание помещений, увлажнение воздуха, прием витаминов и избегание переохлаждения.',
        categoryId: categoryMap['Инфекционные болезни'],
        createdAt: new Date('2025-12-20'),
        updatedAt: new Date('2025-12-20')
      },
      {
        question: 'Как часто следует посещать стоматолога для профилактического осмотра?',
        answer: 'Рекомендуется посещать стоматолога для профилактического осмотра не реже 2 раз в год, при наличии проблем - по назначению врача.',
        categoryId: categoryMap['Профилактика'],
        createdAt: new Date('2025-12-15'),
        updatedAt: new Date('2025-12-15')
      },
      {
        question: 'Какие симптомы указывают на развитие аллергии?',
        answer: 'Основные симптомы аллергии включают чихание, зуд в носу и глазах, кожную сыпь, отеки и затрудненное дыхание. При возникновении этих симптомов следует обратиться к врачу.',
        categoryId: categoryMap['Терапия'],
        createdAt: new Date('2026-01-20'),
        updatedAt: new Date('2026-01-20')
      },
      {
        question: 'Как предотвратить развитие кариеса у детей?',
        answer: 'Для профилактики кариеса у детей необходимо регулярно чистить зубы, ограничить потребление сахара, использовать фторсодержащие зубные пасты и регулярно посещать стоматолога.',
        categoryId: categoryMap['Педиатрия'],
        createdAt: new Date('2026-01-18'),
        updatedAt: new Date('2026-01-18')
      },
      {
        question: 'Какие меры предосторожности следует соблюдать при уходе за пожилыми людьми?',
        answer: 'При уходе за пожилыми людьми необходимо обеспечить безопасность окружающей среды, регулярный медицинский контроль, правильное питание и эмоциональную поддержку.',
        categoryId: categoryMap['Гериатрия'],
        createdAt: new Date('2026-01-16'),
        updatedAt: new Date('2026-01-16')
      },
      {
        question: 'Как распознать симптомы депрессии?',
        answer: 'Основные симптомы депрессии включают продолжительное снижение настроения, потерю интереса к деятельности, усталость, нарушения сна и аппетита. При наличии этих симптомов следует обратиться к специалисту.',
        categoryId: categoryMap['Психиатрия'],
        createdAt: new Date('2026-01-12'),
        updatedAt: new Date('2026-01-12')
      },
      {
        question: 'Как предотвратить развитие мозолей на ногах?',
        answer: 'Для профилактики мозолей необходимо носить правильно подобранную обувь, использовать защитные прокладки, регулярно ухаживать за кожей ног и избегать длительного трения.',
        categoryId: categoryMap['Дерматология'],
        createdAt: new Date('2026-01-08'),
        updatedAt: new Date('2026-01-08')
      }
    ];
    
    questions.push(...additionalQuestions);
    
    // Генерируем 100 дополнительных карточек
    // Массивы для генерации различных вопросов и ответов
    const questionTemplates = [
      'Как часто следует проходить обследование на {тема}?',
      'Какие симптомы указывают на {тема}?',
      'Какие методы лечения существуют для {тема}?',
      'Как предотвратить развитие {тема}?',
      'Какие факторы риска связаны с {тема}?',
      'Как диагностируют {тема}?',
      'Какие осложнения могут возникнуть при {тема}?',
      'Какова эффективность лечения {тема}?',
      'Какие препараты применяются при {тема}?',
      'Какие рекомендации по образу жизни при {тема}?'
    ];
    
    const answerTemplates = [
      'Рекомендуется регулярное обследование каждые {период} для профилактики и раннего выявления.',
      'Основные симптомы включают {симптом1}, {симптом2} и {симптом3}. При их появлении следует обратиться к врачу.',
      'Современные методы лечения включают {метод1}, {метод2} и {метод3}. Выбор зависит от стадии заболевания.',
      'Профилактика включает {мера1}, {мера2} и {мера3}. Регулярные осмотры помогают выявить заболевание на ранней стадии.',
      'Факторы риска включают {фактор1}, {фактор2} и {фактор3}. Снижение риска возможно при изменении образа жизни.',
      'Диагностика включает {метод1}, {метод2} и {метод3}. Точность диагноза зависит от квалификации врача и оборудования.',
      'Возможные осложнения включают {осложнение1}, {осложнение2} и {осложнение3}. Своевременное лечение снижает риск осложнений.',
      'Эффективность лечения составляет {процент}% при соблюдении всех рекомендаций врача и своевременном обращении за помощью.',
      'Применяются препараты {препарат1}, {препарат2} и {препарат3}. Дозировка и курс лечения определяются индивидуально.',
      'Рекомендуется {мера1}, {мера2} и {мера3}. Отказ от вредных привычек и регулярная физическая активность улучшают прогноз.'
    ];
    
    const topics = [
      'гипертония', 'диабет', 'астма', 'гастрит', 'остеохондроз', 
      'артериальная гипертензия', 'бронхит', 'пневмония', 'гастроэзофагеальная рефлюксная болезнь',
      'язва желудка', 'панкреатит', 'гепатит', 'нефропатия', 'уролитиаз',
      'простатит', 'аденома простаты', 'мастопатия', 'миома матки', 'эндометриоз',
      'остеопороз', 'артроз', 'артрит', 'сколиоз', 'кифоз',
      'лордоз', 'мигрень', 'инсульт', 'инфаркт', 'онкология',
      'лейкоз', 'лимфома', 'меланома', 'рак легких', 'рак молочной железы',
      'рак простаты', 'рак толстой кишки', 'рак печени', 'рак поджелудочной железы', 'рак почки',
      'рак мочевого пузыря', 'рак шейки матки', 'рак яичников', 'рак кожи', 'рак костей'
    ];
    
    const periods = ['3 месяца', '6 месяцев', '1 год', '2 года', '5 лет'];
    const symptoms = ['головная боль', 'тошнота', 'слабость', 'повышенная температура', 'одышка', 'боль в груди', 'нарушение сна', 'потеря аппетита', 'раздражительность', 'апатия'];
    const methods = ['лечение антибиотиками', 'физиотерапия', 'хирургическое вмешательство', 'прием витаминов', 'диета', 'упражнения ЛФК', 'массаж', 'иглоукалывание', 'лазерная терапия', 'магнитотерапия'];
    const measures = ['здоровое питание', 'регулярные физические упражнения', 'отказ от вредных привычек', 'контроль веса', 'снижение стресса', 'соблюдение режима сна', 'прием витаминов', 'регулярные медицинские осмотры', 'закаливание', 'избегание переохлаждения'];
    const factors = ['наследственность', 'возраст', 'пол', 'образ жизни', 'профессиональные вредности', 'экологическая обстановка', 'хронические заболевания', 'прием лекарств', 'гормональные нарушения', 'иммунные расстройства'];
    const complications = ['хроническая форма', 'метастазы', 'инвалидность', 'летальный исход', 'рецидив', 'осложнения со стороны других органов', 'психологические расстройства', 'социальная дезадаптация', 'экономические трудности', 'снижение качества жизни'];
    const medicines = ['анальгетики', 'антибиотики', 'противовоспалительные препараты', 'витамины', 'гормоны', 'иммуномодуляторы', 'антидепрессанты', 'транквилизаторы', 'нейролептики', 'ноотропы'];
    
    for (let i = 0; i < 100; i++) {
      const topicIndex = Math.floor(Math.random() * topics.length);
      // Используем categoryMap для получения правильного categoryId
      const categoryName = Object.keys(categoryMap)[Math.floor(Math.random() * Object.keys(categoryMap).length)];
      const categoryId = categoryMap[categoryName];
      const questionTemplateIndex = Math.floor(Math.random() * questionTemplates.length);
      const answerTemplateIndex = Math.floor(Math.random() * answerTemplates.length);
      const periodIndex = Math.floor(Math.random() * periods.length);
      
      // Генерируем случайные симптомы, методы, меры и т.д.
      const randomSymptoms = [];
      const randomMethods = [];
      const randomMeasures = [];
      const randomFactors = [];
      const randomComplications = [];
      const randomMedicines = [];
      
      for (let j = 0; j < 3; j++) {
        randomSymptoms.push(symptoms[Math.floor(Math.random() * symptoms.length)]);
        randomMethods.push(methods[Math.floor(Math.random() * methods.length)]);
        randomMeasures.push(measures[Math.floor(Math.random() * measures.length)]);
        randomFactors.push(factors[Math.floor(Math.random() * factors.length)]);
        randomComplications.push(complications[Math.floor(Math.random() * complications.length)]);
        randomMedicines.push(medicines[Math.floor(Math.random() * medicines.length)]);
      }
      
      const question = questionTemplates[questionTemplateIndex].replace('{тема}', topics[topicIndex]);
      const answer = answerTemplates[answerTemplateIndex]
        .replace('{период}', periods[periodIndex])
        .replace('{симптом1}', randomSymptoms[0])
        .replace('{симптом2}', randomSymptoms[1])
        .replace('{симптом3}', randomSymptoms[2])
        .replace('{метод1}', randomMethods[0])
        .replace('{метод2}', randomMethods[1])
        .replace('{метод3}', randomMethods[2])
        .replace('{мера1}', randomMeasures[0])
        .replace('{мера2}', randomMeasures[1])
        .replace('{мера3}', randomMeasures[2])
        .replace('{фактор1}', randomFactors[0])
        .replace('{фактор2}', randomFactors[1])
        .replace('{фактор3}', randomFactors[2])
        .replace('{осложнение1}', randomComplications[0])
        .replace('{осложнение2}', randomComplications[1])
        .replace('{осложнение3}', randomComplications[2])
        .replace('{препарат1}', randomMedicines[0])
        .replace('{препарат2}', randomMedicines[1])
        .replace('{препарат3}', randomMedicines[2])
        .replace('{процент}', Math.floor(Math.random() * 40 + 60).toString()); // 60-99%
      
      questions.push({
        question,
        answer,
        categoryId: categoryId,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Случайная дата в пределах последних 30 дней
        updatedAt: new Date()
      });
    }
    
    await queryInterface.bulkInsert('Questions', questions, {});
    console.log('Вопросы успешно созданы');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Questions', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
  }
};