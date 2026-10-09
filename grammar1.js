/* ===== GRAMÁTICA: AEF 1 (Base Files 1–6 y A1++ Files 7–12) =====
   Formato de ítems:
   m: opción múltiple  -> "texto [correcta|mala|mala] texto ## explicación"
   g: completar        -> "texto {resp|alternativa} (pista) texto"
   e: error            -> "texto *mal>bien* texto"
   t: traducción       -> "español = English|alternativa"
   o: ordenar          -> "English sentence."
*/
const GRAMMAR = [];
const G = o => GRAMMAR.push(o);

/* ---------------- BASE (AEF 1, Files 1–6) ---------------- */
G({id:'B-1a',book:'B',file:1,title:'Verb be (+ pronouns)',es:'Verbo to be: ser / estar',
form:[['p','I am (I\'m) · you/we/they are (\'re) · he/she/it is (\'s)'],['n','I\'m not · you aren\'t · he isn\'t'],['q','Am I…? · Are you…? · Is she…?'],['i','Respuestas cortas: Yes, I am. / No, she isn\'t.']],
uses:['Nombre, edad, nacionalidad, trabajo: <i>I\'m 25. She\'s a nurse.</i>','Estados y lugares: <i>We\'re at home. It\'s cold.</i>','En inglés la edad va con <b>be</b>, no con "have".'],
ex:[['I\'m from El Salvador.','Soy de El Salvador.'],['They aren\'t at work today.','Ellos no están en el trabajo hoy.'],['Is your teacher American?','¿Tu profesor es estadounidense?'],['It\'s hot in San Salvador.','Hace calor en San Salvador.']],
errs:[['I have 30 years.','I\'m 30 (years old).','La edad usa be.'],['Is cold today.','It\'s cold today.','Siempre necesitas sujeto.']],
items:['m:My sister [is|are|am] a doctor.','m:We [are|is|am] from San Miguel.','m:[Are|Is|Do] you married?','g:I {\'m not|am not} (not be) tired.','g:{Is} your brother at home? – No, he isn\'t.','e:I *have>am* twenty-five years old.','e:*Is>It\'s* very hot today.','t:Ella es enfermera. = She\'s a nurse.|She is a nurse.','t:¿Estás cansado? = Are you tired?','o:Where are you from?','o:My parents are not at home.']});

G({id:'B-1b',book:'B',file:1,title:'Possessive adjectives',es:'Adjetivos posesivos: my, your, his…',
form:[['i','I → my · you → your · he → his · she → her · it → its · we → our · they → their']],
uses:['Van antes del sustantivo y no cambian en plural: <i>my friends</i> (no "mys friends").','<b>his</b> = de él, <b>her</b> = de ella (en español ambos son "su").'],
ex:[['This is my phone.','Este es mi teléfono.'],['Her name is Ana.','Su nombre (de ella) es Ana.'],['Their house is big.','Su casa (de ellos) es grande.'],['What\'s your email?','¿Cuál es tu correo?']],
errs:[['María and his husband…','María and her husband…','her = de ella.'],['Its a nice car.','It\'s a nice car.','its = su (posesivo); it\'s = it is.']],
items:['m:Carlos lives with [his|her|their] mother.','m:Ana loves [her|his|its] job.','m:We love [our|us|we] new apartment.','m:The dog is eating [its|it\'s|his] food.','g:They have a car. {Their} car is red.','e:My sister and *his>her* husband live in Santa Ana.','t:Su nombre (de él) es Luis. = His name is Luis.|His name\'s Luis.','o:What is your phone number?']});

G({id:'B-2a',book:'B',file:2,title:'a / an, plurals, this / that',es:'Artículos a/an, plurales y demostrativos',
form:[['i','a + sonido consonante: a book, a university · an + sonido vocal: an apple, an hour'],['i','Plurales: +s (cars), +es (watches, boxes), y→ies (cities); irregulares: man→men, woman→women, child→children, person→people'],['i','this/these = aquí (cerca) · that/those = allá (lejos)']],
uses:['Profesiones con a/an: <i>She\'s a teacher. He\'s an engineer.</i>','this/that + singular; these/those + plural.'],
ex:[['This is an umbrella.','Esto es un paraguas.'],['Those shoes are nice.','Esos zapatos son bonitos.'],['There are three children.','Hay tres niños.'],['I\'m a student.','Soy estudiante.']],
errs:[['I\'m teacher.','I\'m a teacher.','Las profesiones llevan a/an.'],['These is my keys.','These are my keys.','these + are.']],
items:['m:She\'s [an|a|the] engineer.','m:I have [a|an] university degree. ## university suena /ju/ (consonante)','m:Look at [those|that|this] birds in the sky!','m:Two [women|womans|woman] are waiting.','g:I have three {children} (child).','g:We visited two {cities} (city).','e:He\'s *doctor>a doctor* at the hospital.','e:*This>These* are my friends.','t:Esos son mis libros. = Those are my books.','o:Is this your umbrella?']});

G({id:'B-2b',book:'B',file:2,title:'Adjectives',es:'Adjetivos: posición y forma',
form:[['i','be + adjective: The car is fast.'],['i','adjective + noun: a fast car (el adjetivo va ANTES)'],['i','Los adjetivos no tienen plural: two fast cars']],
uses:['Usa <b>very</b> para intensificar: <i>very cheap</i>.','Usa <b>quite</b> para "bastante": <i>quite big</i>.'],
ex:[['It\'s a very old city.','Es una ciudad muy antigua.'],['They\'re expensive shoes.','Son zapatos caros.'],['My car is quite new.','Mi carro es bastante nuevo.']],
errs:[['a car red','a red car','Adjetivo antes del sustantivo.'],['They are bigs.','They are big.','Sin plural en adjetivos.']],
items:['m:I want a [new phone|phone new|phones new].','m:They are [expensive|expensives] watches.','e:She has a *car red>red car*.','g:It isn\'t a cheap restaurant. It\'s an {expensive} restaurant.','t:Es una casa muy grande. = It\'s a very big house.','o:She has a beautiful old house.']});

G({id:'B-3a',book:'B',file:3,title:'Present simple (+ / −)',es:'Presente simple: afirmativo y negativo',
form:[['p','I/you/we/they work · he/she/it works'],['n','I don\'t work · he doesn\'t work'],['i','he/she/it: +s, +es (watches, goes, does), y→ies (studies); have → has']],
uses:['Rutinas y hábitos: <i>I get up at 6.</i>','Verdades y hechos: <i>Water boils at 100°.</i>','Después de doesn\'t el verbo va SIN s: <i>She doesn\'t like</i>.'],
ex:[['She works in a bank.','Ella trabaja en un banco.'],['We don\'t eat meat.','No comemos carne.'],['My dad watches TV every night.','Mi papá ve televisión cada noche.'],['He doesn\'t have a car.','Él no tiene carro.']],
errs:[['She work in a bank.','She works in a bank.','he/she/it + s.'],['He doesn\'t likes coffee.','He doesn\'t like coffee.','Después de doesn\'t: forma base.']],
items:['m:My brother [studies|study|studys] English.','m:They [don\'t|doesn\'t|not] live here.','m:She [has|have|haves] two cats.','g:He {watches} (watch) soccer on Sundays.','g:My mom {doesn\'t work|does not work} (not work) on Saturdays.','e:Ana *speak>speaks* three languages.','e:He doesn\'t *works>work* at night.','t:Ella no come carne. = She doesn\'t eat meat.|She does not eat meat.','t:Mi papá trabaja en un hospital. = My dad works in a hospital.|My father works in a hospital.','o:I don\'t drink coffee in the evening.']});

G({id:'B-3b',book:'B',file:3,title:'Present simple (?)',es:'Presente simple: preguntas con do/does',
form:[['q','Do I/you/we/they work? · Does he/she/it work?'],['i','Respuestas cortas: Yes, I do. / No, she doesn\'t.'],['i','Wh-: Where do you live? What does she do?']],
uses:['Orden: (Wh-) + do/does + sujeto + verbo base.','<i>What do you do?</i> = ¿A qué te dedicas?'],
ex:[['Do you like pizza?','¿Te gusta la pizza?'],['Where does he work?','¿Dónde trabaja él?'],['What time do you get up?','¿A qué hora te levantas?']],
errs:[['Where you live?','Where do you live?','Falta el auxiliar.'],['Does she works?','Does she work?','Con does el verbo va sin s.']],
items:['m:[Does|Do|Is] your sister live in Santa Tecla?','m:What [do|does|are] you do?','m:Does he [play|plays|playing] the guitar?','g:{Do} you have any brothers or sisters?','g:Where {does} your father work?','e:Where *you>do you* work?','e:Does she *speaks>speak* French?','t:¿Dónde vives? = Where do you live?','t:¿A qué hora se levanta ella? = What time does she get up?','o:What time do you have lunch?']});

G({id:'B-4a',book:'B',file:4,title:'Possessive \'s, whose',es:'Posesivo \'s y whose (de quién)',
form:[['i','persona + \'s + cosa: Ana\'s car = el carro de Ana'],['i','plural con s: my parents\' house'],['q','Whose + noun + is…? Whose bag is this? – It\'s Tom\'s.']],
uses:['En inglés no se dice "the car of Ana", se dice <b>Ana\'s car</b>.'],
ex:[['This is my brother\'s room.','Este es el cuarto de mi hermano.'],['Whose phone is this?','¿De quién es este teléfono?'],['It\'s my mother\'s.','Es de mi mamá.']],
errs:[['the car of my father','my father\'s car','Usa \'s para personas.'],['Who\'s bag is this?','Whose bag is this?','Whose = de quién; who\'s = who is.']],
items:['m:This is [my sister\'s|my sisters|of my sister] bike.','m:[Whose|Who\'s|Who] jacket is this?','e:This is the *house of Luis>Luis\'s house*.','t:¿De quién es este libro? = Whose book is this?|Whose is this book?','t:Es el carro de mi papá. = It\'s my dad\'s car.|It is my dad\'s car.|It\'s my father\'s car.','o:Whose keys are these?']});

G({id:'B-4b',book:'B',file:4,title:'Prepositions of time: in / on / at',es:'Preposiciones de tiempo',
form:[['i','AT + hora/momento: at 7:00, at night, at the weekend'],['i','ON + día/fecha: on Monday, on May 5th, on my birthday'],['i','IN + mes/año/estación/parte del día: in July, in 2024, in the summer, in the morning']],
uses:['Truco: AT es lo más pequeño (hora), ON es el día, IN es lo más grande (mes, año).'],
ex:[['I get up at 6:30.','Me levanto a las 6:30.'],['My birthday is in March.','Mi cumpleaños es en marzo.'],['See you on Friday!','¡Nos vemos el viernes!'],['I study in the evening.','Estudio en la noche (tarde-noche).']],
errs:[['in Monday','on Monday','Días con on.'],['at the morning','in the morning','Partes del día con in (excepto at night).']],
items:['m:The class starts [at|on|in] 6 p.m.','m:I was born [in|on|at] 1999.','m:We have English [on|in|at] Tuesdays and Thursdays.','m:I work [at|in|on] night.','g:My birthday is {on} October 12th.','g:It\'s very hot here {in} April.','e:I go to the gym *in>on* Saturdays.','t:Me levanto a las seis. = I get up at six.|I get up at 6.','o:I usually go to bed at eleven.']});

G({id:'B-4c',book:'B',file:4,title:'Adverbs of frequency',es:'Adverbios de frecuencia',
form:[['i','always (100%) · usually · often · sometimes · hardly ever · never (0%)'],['i','Van ANTES del verbo: I usually get up at 7.'],['i','Van DESPUÉS de be: She\'s never late.']],
uses:['Con expresiones: every day, once a week, twice a month (al final de la oración).','How often…? = ¿Con qué frecuencia…?'],
ex:[['I always have breakfast.','Siempre desayuno.'],['He\'s often tired.','Él está cansado a menudo.'],['We go out once a week.','Salimos una vez a la semana.']],
errs:[['I go always to work by bus.','I always go to work by bus.','Antes del verbo principal.'],['She never is late.','She\'s never late.','Después de be.']],
items:['m:She [is never|never is|never] late for class.','m:I [usually get up|get up usually|get usually up] at 6:00.','m:How [often|many|much] do you go to the gym?','e:I *go always>always go* to bed late.','e:He *never is>is never* hungry in the morning.','t:Casi nunca veo televisión. = I hardly ever watch TV.|I hardly ever watch television.','t:Ella siempre está feliz. = She\'s always happy.|She is always happy.','o:We sometimes eat out on Fridays.']});

G({id:'B-5a',book:'B',file:5,title:'can / can\'t',es:'Habilidad y permiso con can',
form:[['p','I/you/he… can swim (igual para todos)'],['n','I can\'t (cannot) swim'],['q','Can you swim? – Yes, I can. / No, I can\'t.']],
uses:['Habilidad: <i>I can play the piano.</i>','Posibilidad/permiso: <i>You can park here. Can I open the window?</i>','Nunca "to" después de can.'],
ex:[['She can speak English very well.','Ella puede hablar inglés muy bien.'],['I can\'t come tomorrow.','No puedo venir mañana.'],['Can you help me?','¿Me puedes ayudar?']],
errs:[['She cans swim.','She can swim.','can no cambia.'],['I can to drive.','I can drive.','Sin to.']],
items:['m:My son [can|cans|can to] ride a bike.','m:[Can you|Do you can|You can] help me, please?','g:I {can\'t|cannot|can not} (not) swim. I never learned.','e:She *cans>can* play the guitar.','e:We can *to go>go* tomorrow.','t:¿Puedes hablar inglés? = Can you speak English?','o:Can I sit here, please?']});

G({id:'B-5b',book:'B',file:5,title:'Present continuous',es:'Presente continuo: acciones de ahora',
form:[['p','be + verb-ing: I\'m working · she\'s working · they\'re working'],['n','I\'m not working · he isn\'t working'],['q','Are you working? · What is she doing?'],['i','Ortografía: make→making, swim→swimming, lie→lying']],
uses:['Lo que pasa ahora mismo: <i>I\'m watching TV now.</i>','Situaciones temporales: <i>I\'m living with my aunt this month.</i>'],
ex:[['Look! It\'s raining.','¡Mira! Está lloviendo.'],['What are you doing?','¿Qué estás haciendo?'],['She isn\'t listening.','Ella no está escuchando.']],
errs:[['I watching TV.','I\'m watching TV.','Falta be.'],['She is swiming.','She is swimming.','Se dobla la m.']],
items:['m:Shh! The baby [is sleeping|sleeps|sleeping].','m:What [are you|do you|you are] doing right now?','g:They {\'re playing|are playing} (play) soccer in the park now.','g:She {isn\'t working|is not working|\'s not working} (not work) today.','g:I\'m {swimming} (swim) in the pool.','e:Look! It *rains>is raining*.','e:He is *siting>sitting* next to the window.','t:¿Qué estás haciendo? = What are you doing?','t:Está lloviendo. = It\'s raining.|It is raining.','o:Why are you laughing at me?']});

G({id:'B-6a',book:'B',file:6,title:'like / love / hate + -ing',es:'Gustos con verbo + -ing',
form:[['p','I love / like / don\'t mind / don\'t like / hate + verb-ing'],['q','Do you like cooking?']],
uses:['Para hablar de actividades que te gustan en general.','<b>don\'t mind</b> = no me molesta / me da igual.'],
ex:[['I love dancing.','Me encanta bailar.'],['She hates getting up early.','Ella odia levantarse temprano.'],['Do you like reading?','¿Te gusta leer?']],
errs:[['I like play soccer.','I like playing soccer.','Verbo + -ing.'],['I am like cooking.','I like cooking.','like es verbo, no usa be.']],
items:['m:I hate [getting|get|to getting] up early.','m:Do you like [cooking|cook|cooks]?','g:My dad loves {fishing} (fish).','e:She likes *dance>dancing* salsa.','t:Me encanta leer. = I love reading.','o:I don\'t mind doing the dishes.']});

G({id:'B-6b',book:'B',file:6,title:'Object pronouns',es:'Pronombres de objeto: me, him, her…',
form:[['i','I→me · you→you · he→him · she→her · it→it · we→us · they→them']],
uses:['Van DESPUÉS del verbo o de una preposición: <i>Call me. I\'m with them.</i>'],
ex:[['I love her.','La amo.'],['Can you help us?','¿Nos puedes ayudar?'],['I don\'t know him.','No lo conozco.']],
errs:[['She loves I.','She loves me.','Después del verbo: me.'],['I them see.','I see them.','El pronombre va después del verbo.']],
items:['m:Can you call [me|I|my] later?','m:I like Ana, but I don\'t see [her|she|his] often.','m:These are my keys. Give [them|they|their] to me.','e:My parents? I visit *they>them* every Sunday.','t:Lo conozco. = I know him.','o:Please tell us the answer.']});

G({id:'B-6c',book:'B',file:6,title:'be or do?',es:'¿Uso be o do?',
form:[['i','BE: con adjetivos, lugares, nombres, -ing → Are you tired? Is she working?'],['i','DO: con verbos en presente simple → Do you work? Does she like…?']],
uses:['Pregunta clave: ¿hay otro verbo principal en presente simple? → do/does. ¿no hay verbo o es -ing? → be.'],
ex:[['Are you hungry?','¿Tienes hambre?'],['Do you speak English?','¿Hablas inglés?'],['Is he watching TV?','¿Está viendo TV?']],
errs:[['Do you tired?','Are you tired?','Adjetivo → be.'],['Are you like coffee?','Do you like coffee?','Verbo → do.']],
items:['m:[Are|Do|Does] you hungry?','m:[Does|Is|Do] she work on Saturdays?','m:[Is|Does|Do] it raining?','m:What [do|are|does] you usually have for breakfast?','e:*Do>Are* you from Guatemala?','e:*Are>Do* you like soccer?','o:Are you watching the game?']});

/* ---------------- A1++ (AEF 1, Files 7–12) ---------------- */
G({id:'1-7a',book:1,file:7,title:'was / were',es:'Pasado del verbo be',
form:[['p','I/he/she/it was · you/we/they were'],['n','wasn\'t · weren\'t'],['q','Was he…? · Were you…? – Yes, I was. / No, they weren\'t.'],['i','Nacimiento: I was born in 1995.']],
uses:['Estados en el pasado: <i>I was tired yesterday.</i>','Lugares en el pasado: <i>We were at the beach.</i>','<b>was born</b> = nací (siempre en pasado).'],
ex:[['She was a famous painter.','Ella fue una pintora famosa.'],['We weren\'t at home last night.','No estábamos en casa anoche.'],['Where were you born?','¿Dónde naciste?'],['Was the movie good?','¿Estuvo buena la película?']],
errs:[['I born in 1998.','I was born in 1998.','Falta was.'],['They was happy.','They were happy.','they → were.']],
items:['m:My grandparents [were|was|are] farmers.','m:Where [were|was|did] you born?','m:I [wasn\'t|weren\'t|didn\'t] at work yesterday.','g:{Was} the concert good? – Yes, it was amazing.','g:We {weren\'t|were not} (not) at home last weekend.','e:I *born>was born* in San Salvador.','e:You *was>were* very kind to me.','t:¿Dónde estabas ayer? = Where were you yesterday?','t:Nací en 1990. = I was born in 1990.','o:Who was your first teacher?','o:The tickets were very expensive.']});

G({id:'1-7b',book:1,file:7,title:'Past simple: regular verbs',es:'Pasado simple: verbos regulares',
form:[['p','verb + -ed: worked, played, watched (igual para todos)'],['n','didn\'t + base: I didn\'t work'],['q','Did you work? – Yes, I did. / No, I didn\'t.'],['i','Ortografía: live→lived, study→studied, stop→stopped, play→played']],
uses:['Acciones terminadas en el pasado: <i>I watched a movie last night.</i>','Expresiones: yesterday, last week, two days ago, in 2020.','Pronunciación de -ed: /t/ worked, /d/ played, /ɪd/ wanted.'],
ex:[['I called my mom yesterday.','Llamé a mi mamá ayer.'],['They didn\'t study for the test.','No estudiaron para el examen.'],['Did you watch the game?','¿Viste el partido?'],['We moved here two years ago.','Nos mudamos aquí hace dos años.']],
errs:[['I didn\'t worked.','I didn\'t work.','Con didn\'t: forma base.'],['I study yesterday.','I studied yesterday.','Pasado: +ed.']],
items:['m:Last night I [watched|watch|watching] a great movie.','m:She [didn\'t call|didn\'t called|not called] me.','m:[Did|Do|Was] you visit your grandmother?','g:We {stopped} (stop) at a café on the way.','g:She {studied} (study) in Mexico in 2019.','g:They {didn\'t like|did not like} (not like) the food.','e:I *study>studied* English last year.','e:He didn\'t *finished>finish* his homework.','t:Llamé a mi amiga ayer. = I called my friend yesterday.','t:Nos mudamos hace dos años. = We moved two years ago.','o:Did you enjoy the party last night?']});

G({id:'1-7c',book:1,file:7,title:'Past simple: irregular verbs',es:'Pasado simple: verbos irregulares',
form:[['p','go→went · have→had · get→got · see→saw · buy→bought …'],['n','didn\'t + base: I didn\'t go (¡no "didn\'t went"!)'],['q','Did you go? What did you buy?']],
uses:['Hay que memorizar la forma pasada (ver pestaña Verbos).','En negativo y pregunta SIEMPRE vuelves a la forma base.'],
ex:[['I went to the beach on Sunday.','Fui a la playa el domingo.'],['She bought a new dress.','Ella compró un vestido nuevo.'],['We didn\'t see the sea.','No vimos el mar.'],['What did you have for dinner?','¿Qué cenaste?']],
errs:[['I goed to work.','I went to work.','go es irregular.'],['Did you went?','Did you go?','Con did: forma base.']],
items:['m:We [went|goed|go] to Antigua last weekend.','m:I [bought|buyed|buy] some bread this morning.','m:What did you [do|did|done] yesterday?','g:She {got} (get) up at 5:00 this morning.','g:They {had} (have) lunch at a nice restaurant.','g:I {saw} (see) your brother at the supermarket.','g:He {didn\'t go|did not go} (not go) to work yesterday.','e:Did you *saw>see* the news?','e:I *drinked>drank* too much coffee.','t:Fuimos a la playa. = We went to the beach.','t:¿Qué compraste? = What did you buy?','o:Where did you go on vacation?']});

G({id:'1-8a',book:1,file:8,title:'Past simple: questions & negatives',es:'Pasado simple: preguntas y negativos',
form:[['q','(Wh-) + did + subject + base: Where did you go? What did she say?'],['n','subject + didn\'t + base: He didn\'t come.'],['i','Excepción: was/were no usa did → Were you tired?']],
uses:['Muy usado para contar historias y preguntar por el fin de semana.'],
ex:[['What time did you get home?','¿A qué hora llegaste a casa?'],['I didn\'t hear the alarm.','No escuché la alarma.'],['How did you meet your wife?','¿Cómo conociste a tu esposa?']],
errs:[['Where you went?','Where did you go?','Did + base.'],['Did you were at home?','Were you at home?','be no usa did.']],
items:['m:What time [did you get|you got|did you got] home?','m:[Were|Did|Was] you tired after the trip?','m:She [didn\'t come|didn\'t came|not came] to class.','g:How {did} you meet your best friend?','e:Where *you went>did you go* last night?','e:*Did you were>Were you* at the party?','t:¿Cómo estuvo tu fin de semana? = How was your weekend?','t:No escuché la alarma. = I didn\'t hear the alarm.|I did not hear the alarm.','o:What did you do last weekend?']});

G({id:'1-8b',book:1,file:8,title:'there is / there are',es:'Hay (presente) + some / any',
form:[['p','There\'s a + singular · There are some + plural'],['n','There isn\'t a… · There aren\'t any…'],['q','Is there a…? · Are there any…?']],
uses:['Para describir lugares: casa, ciudad, cuarto.','<b>some</b> en afirmativo, <b>any</b> en negativo y preguntas (con plurales).'],
ex:[['There\'s a big sofa in the living room.','Hay un sofá grande en la sala.'],['There are some books on the table.','Hay unos libros en la mesa.'],['Are there any restaurants near here?','¿Hay restaurantes por aquí?'],['There isn\'t a garage.','No hay garaje.']],
errs:[['There is two bedrooms.','There are two bedrooms.','Plural → are.'],['Have a bank near here?','Is there a bank near here?','"Hay" = there is.']],
items:['m:[There are|There is|They are] three bedrooms in my house.','m:Is there [a|any|some] bank near here?','m:There aren\'t [any|some|a] chairs in the kitchen.','g:{Are} there any good restaurants in your neighborhood?','g:There {isn\'t|is not} (not) a microwave in the kitchen.','e:*There is>There are* two bathrooms upstairs.','e:*Have>Is there* a pharmacy near here?','t:Hay un parque cerca de mi casa. = There\'s a park near my house.|There is a park near my house.','t:¿Hay sillas? = Are there any chairs?|Are there chairs?','o:There are some pictures on the wall.']});

G({id:'1-8c',book:1,file:8,title:'there was / there were',es:'Había / hubo',
form:[['p','There was + singular · There were + plural'],['n','There wasn\'t… · There weren\'t any…'],['q','Was there…? · Were there any…?'],['i','Prepositions of place: in, on, under, next to, between, opposite, behind, in front of']],
uses:['Describir lugares o situaciones en el pasado: <i>There were a lot of people.</i>'],
ex:[['There was a strange noise.','Había un ruido extraño.'],['There were a lot of people at the concert.','Había mucha gente en el concierto.'],['Was there a TV in the room?','¿Había televisión en la habitación?']],
errs:[['There was many people.','There were a lot of people.','Plural → were.'],['Had a party yesterday.','There was a party yesterday.','"Hubo" = there was.']],
items:['m:[There were|There was|They were] a lot of cars on the road.','m:[Was there|There was|Were there] a TV in your hotel room?','m:The cat is [under|in front|between] the table.','g:There {wasn\'t|was not} (not) any hot water this morning.','e:*There was>There were* five people in the elevator.','t:Había mucha gente en la fiesta. = There were a lot of people at the party.|There were many people at the party.','o:There was a big tree in front of the house.']});

G({id:'1-9a',book:1,file:9,title:'Countable / uncountable: a, some, any',es:'Sustantivos contables e incontables',
form:[['i','Contables (se cuentan): an apple, two eggs → a/an, some, any'],['i','Incontables (no se cuentan): water, rice, bread, milk, money → some, any (nunca a/an ni plural)'],['p','I have some eggs / some milk.'],['n','I don\'t have any eggs / any milk.']],
uses:['<b>some</b> también en ofrecimientos: <i>Would you like some coffee?</i>','Palabras incontables comunes: bread, cheese, rice, pasta, fruit, information, advice, furniture.'],
ex:[['I\'d like some water, please.','Quisiera agua, por favor.'],['There\'s some rice in the cupboard.','Hay arroz en la alacena.'],['We don\'t have any bread.','No tenemos pan.'],['I eat an apple every day.','Como una manzana cada día.']],
errs:[['a bread','some bread / a loaf of bread','bread es incontable.'],['some informations','some information','Sin plural.']],
items:['m:Can I have [some|a|an] water, please?','m:We don\'t have [any|some|a] milk.','m:I eat [an|a|some] orange every morning.','m:Would you like [some|any|a] coffee?','g:Is there {any} sugar in this coffee?','e:I need *a>some* bread for the sandwiches.','e:She gave me some good *advices>advice*.','t:No tenemos huevos. = We don\'t have any eggs.|We don\'t have eggs.|We do not have any eggs.','o:Is there any cheese in the fridge?']});

G({id:'1-9b',book:1,file:9,title:'how much / how many, a lot of',es:'Cuantificadores',
form:[['q','How many + plural? → How many eggs? · How much + incontable? → How much milk?'],['p','a lot of / lots of (con ambos)'],['n','not much (incontable) · not many (plural) · none']],
uses:['How much is it? = ¿Cuánto cuesta?','En afirmativo prefiere <b>a lot of</b>; en negativo/pregunta <b>much/many</b>.'],
ex:[['How many brothers do you have?','¿Cuántos hermanos tienes?'],['How much water do you drink?','¿Cuánta agua tomas?'],['I don\'t eat much meat.','No como mucha carne.'],['She has a lot of friends.','Ella tiene muchos amigos.']],
errs:[['How many money…?','How much money…?','money es incontable.'],['I have much friends.','I have a lot of friends.','Afirmativo → a lot of.']],
items:['m:How [much|many|lot] sugar do you want?','m:How [many|much|lot of] people were there?','m:I don\'t drink [much|many|a lot] coffee.','m:She eats [a lot of|much|many of] vegetables.','g:How {many} cookies did you eat?','g:There aren\'t {many} students today.','e:How *many>much* money do you have?','t:¿Cuánta agua bebes? = How much water do you drink?','t:¿Cuántos hijos tienes? = How many children do you have?|How many kids do you have?','o:How many hours do you sleep?']});

G({id:'1-9c',book:1,file:9,title:'Comparative adjectives',es:'Comparativos',
form:[['i','corto: old→older, big→bigger, easy→easier + than'],['i','largo: more expensive, more interesting + than'],['i','irregulares: good→better · bad→worse · far→farther']],
uses:['Comparar dos cosas: <i>My city is hotter than yours.</i>'],
ex:[['Spanish is easier than English.','El español es más fácil que el inglés.'],['This phone is more expensive than that one.','Este teléfono es más caro que ese.'],['My English is better now.','Mi inglés está mejor ahora.']],
errs:[['more big','bigger','Adjetivo corto → -er.'],['more better','better','No se combina more + -er.'],['bigger that','bigger than','Se usa than.']],
items:['m:My brother is [taller|more tall|tallest] than me.','m:This test is [more difficult|difficulter|more difficulter] than the last one.','m:The weather today is [worse|badder|more bad] than yesterday.','g:A car is {faster} (fast) than a bike.','g:San Salvador is {hotter} (hot) than Toronto.','g:Today I\'m {happier} (happy) than yesterday.','e:My new job is *more good>better* than my old job.','e:She is older *that>than* her husband.','t:Mi hermana es más alta que yo. = My sister is taller than me.|My sister is taller than I am.','o:Is your city bigger than mine?']});

G({id:'1-10a',book:1,file:10,title:'Superlative adjectives',es:'Superlativos',
form:[['i','corto: the oldest, the biggest, the easiest'],['i','largo: the most expensive, the most beautiful'],['i','irregulares: the best · the worst · the farthest']],
uses:['El más… de un grupo: <i>It\'s the biggest city in the country.</i>','Después del superlativo: <b>in</b> + lugar (in the world, in my family).'],
ex:[['It\'s the tallest building in the city.','Es el edificio más alto de la ciudad.'],['She\'s the best student in the class.','Es la mejor estudiante de la clase.'],['That was the worst day of my life.','Ese fue el peor día de mi vida.']],
errs:[['the most big','the biggest','Corto → -est.'],['the best of the world','the best in the world','in + lugar.']],
items:['m:It\'s [the most expensive|the expensivest|more expensive] hotel in town.','m:My dad is the [oldest|older|most old] person in my family.','m:This is the [best|goodest|better] pizza I know.','g:Russia is the {biggest} (big) country in the world.','g:It was the {worst} (bad) movie of the year.','e:He is the *most tall>tallest* boy in the class.','e:It\'s the best restaurant *of>in* the city.','t:Es el día más caliente del año. = It\'s the hottest day of the year.|It is the hottest day of the year.','o:What is the most beautiful place in your country?']});

G({id:'1-10b',book:1,file:10,title:'be going to (plans)',es:'Futuro con going to: planes',
form:[['p','be + going to + base: I\'m going to travel.'],['n','I\'m not going to… · She isn\'t going to…'],['q','Are you going to…? · What are you going to do?']],
uses:['Planes e intenciones ya decididas.','Expresiones: tomorrow, next week, this weekend, in two years.'],
ex:[['I\'m going to visit my aunt next week.','Voy a visitar a mi tía la próxima semana.'],['We aren\'t going to buy a car.','No vamos a comprar carro.'],['What are you going to do this weekend?','¿Qué vas a hacer este fin de semana?']],
errs:[['I going to travel.','I\'m going to travel.','Falta be.'],['She is going to traveling.','She is going to travel.','going to + base.']],
items:['m:I [\'m going to|going to|go to] study tonight.','m:What [are you going to|you are going to|do you going to] do tomorrow?','g:They {aren\'t going to|are not going to|\'re not going to} (not) sell their house.','g:She {\'s going to study|is going to study} (study) medicine next year.','e:We *going>are going* to have a party.','e:He\'s going to *buys>buy* a new laptop.','t:Voy a visitar a mi abuela. = I\'m going to visit my grandmother.|I am going to visit my grandmother.','o:Where are you going to stay?']});

G({id:'1-10c',book:1,file:10,title:'be going to (predictions)',es:'Going to: predicciones con evidencia',
form:[['p','It\'s going to rain. (veo nubes negras)'],['i','Usa going to cuando ves la evidencia ahora.']],
uses:['Predicción basada en lo que ves: <i>Look at that car! It\'s going to crash.</i>'],
ex:[['Look at the sky. It\'s going to rain.','Mira el cielo. Va a llover.'],['Be careful! You\'re going to fall.','¡Cuidado! Te vas a caer.'],['She\'s going to have a baby.','Ella va a tener un bebé.']],
errs:[['It\'s going rain.','It\'s going to rain.','Falta to.']],
items:['m:Look at those clouds! It [\'s going to|going to|is go to] rain.','m:Be careful! You [\'re going to|going to|go to] fall!','g:We\'re late. We {\'re going to miss|are going to miss} (miss) the bus.','e:Look! The glass is going *fall>to fall*.','t:Va a llover. = It\'s going to rain.|It is going to rain.','o:I think he is going to win.']});

G({id:'1-11a',book:1,file:11,title:'Adverbs (manner & modifiers)',es:'Adverbios de modo y modificadores',
form:[['i','adjective + -ly: slow→slowly, quiet→quietly, careful→carefully, easy→easily'],['i','irregulares: good→well · fast→fast · hard→hard · late→late · early→early'],['i','modifiers: incredibly, really, very, quite, not very']],
uses:['El adjetivo describe un sustantivo; el adverbio describe CÓMO se hace un verbo.','<i>She\'s a careful driver. → She drives carefully.</i>'],
ex:[['He speaks English very well.','Él habla inglés muy bien.'],['Please drive slowly.','Por favor maneja despacio.'],['She works hard.','Ella trabaja duro.']],
errs:[['He speaks good English. / He speaks English good.','He speaks English well.','good es adjetivo; well es adverbio.'],['She runs fastly.','She runs fast.','fast no cambia.']],
items:['m:She sings very [well|good|goodly].','m:Please speak [slowly|slow|slowlier].','m:He works very [hard|hardly|harder].','g:Drive {carefully} (careful)!','g:The children played {quietly} (quiet).','e:You speak Spanish very *good>well*.','e:He finished the exam *easy>easily*.','t:Ella trabaja muy duro. = She works very hard.','o:Can you speak more slowly, please?']});

G({id:'1-11b',book:1,file:11,title:'Verbs + to + infinitive',es:'Verbos seguidos de to + verbo',
form:[['i','want, need, would like, decide, hope, plan, learn, forget, try, start + to + base'],['p','I want to learn English.']],
uses:['<i>I\'d like to</i> = me gustaría (más educado que want).','No confundas con like + -ing (gusto general).'],
ex:[['I need to buy some milk.','Necesito comprar leche.'],['She decided to quit her job.','Ella decidió dejar su trabajo.'],['Don\'t forget to call me.','No olvides llamarme.'],['I\'d like to go to New York.','Me gustaría ir a Nueva York.']],
errs:[['I want learn English.','I want to learn English.','Falta to.'],['I need buying…','I need to buy…','need + to.']],
items:['m:I want [to learn|learn|learning] to drive.','m:Don\'t forget [to lock|lock|locking] the door.','m:I\'d like [to go|go|going] to Disney World.','g:We decided {to stay} (stay) at home.','g:She\'s learning {to swim} (swim).','e:I need *buy>to buy* a new phone.','e:They hope *visiting>to visit* Paris.','t:Necesito estudiar más. = I need to study more.','o:I would like to travel around the world.']});

G({id:'1-11c',book:1,file:11,title:'Articles: a / an, the, no article',es:'Artículos',
form:[['i','a/an: primera vez, o profesiones → I saw a dog.'],['i','the: algo específico o ya mencionado, único → The dog was big. The sun.'],['i','Sin artículo: hablar en general → I love dogs. Life is beautiful.'],['i','Sin artículo: at home, at work, go to bed, by bus, on Monday']],
uses:['En español decimos "Me gustan los perros", en inglés <i>I like dogs</i> (sin the).'],
ex:[['I have a cat. The cat is black.','Tengo un gato. El gato es negro.'],['Children love ice cream.','A los niños les encanta el helado.'],['I go to work by bus.','Voy al trabajo en bus.']],
errs:[['I love the music.','I love music.','En general sin the.'],['She is at the home.','She is at home.','Expresión fija.']],
items:['m:I love [—|the|a] chocolate.','m:Can you close [the|a|—] door, please?','m:She\'s [an|a|the] architect.','m:I usually go to work [by|in the|with] bus.','e:*The>—* money doesn\'t buy happiness. ## En general, sin artículo','e:My husband is at *the home>home*.','t:Me gustan los perros. = I like dogs.','o:I saw a great movie on Saturday.']});

G({id:'1-12a',book:1,file:12,title:'Present perfect',es:'Presente perfecto (experiencias)',
form:[['p','have/has + past participle: I\'ve been · she\'s seen'],['n','I haven\'t… · He hasn\'t…'],['q','Have you ever…? – Yes, I have. / No, I haven\'t.'],['i','ever = alguna vez · never = nunca']],
uses:['Experiencias de tu vida SIN decir cuándo: <i>I\'ve been to Mexico.</i>','<b>been</b> (to a place) = haber ido y regresado.'],
ex:[['Have you ever been to the US?','¿Alguna vez has ido a EE. UU.?'],['I\'ve never eaten sushi.','Nunca he comido sushi.'],['She has seen that movie three times.','Ella ha visto esa película tres veces.']],
errs:[['Have you ever went…?','Have you ever been…?','Participio, no pasado.'],['I have never eat…','I have never eaten…','Participio: eaten.']],
items:['m:Have you ever [been|went|go] to Guatemala?','m:She [has|have|is] never driven a car.','m:I\'ve never [seen|saw|see] snow.','g:I {\'ve met|have met} (meet) a famous person.','g:He {hasn\'t|has not} (not) finished the book.','g:Have you ever {eaten} (eat) pupusas?','e:I have never *went>been* to Europe.','e:Have you ever *saw>seen* a ghost?','t:¿Alguna vez has estado en Nueva York? = Have you ever been to New York?','t:Nunca he comido sushi. = I\'ve never eaten sushi.|I have never eaten sushi.','o:Have you ever lost your phone?']});

G({id:'1-12b',book:1,file:12,title:'Present perfect or past simple?',es:'¿Presente perfecto o pasado simple?',
form:[['i','Present perfect: experiencia, SIN tiempo → Have you ever been to Cancún?'],['i','Past simple: detalles, CON tiempo → When did you go? I went in 2019.']],
uses:['Conversación típica: empieza con present perfect y sigue con past simple para los detalles.'],
ex:[['Have you ever been to Roatán? – Yes, I went last year.','¿Has ido a Roatán? – Sí, fui el año pasado.'],['I\'ve seen that movie. I saw it on Netflix.','He visto esa película. La vi en Netflix.']],
errs:[['I have been to Cancún in 2019.','I went to Cancún in 2019.','Con fecha → past simple.'],['Did you ever eat sushi?','Have you ever eaten sushi?','Experiencia → present perfect.']],
items:['m:I [went|have been|have gone] to Cancún in 2019.','m:[Have you ever tried|Did you ever try|Do you ever tried] Japanese food?','m:When [did you see|have you seen|you saw] that movie?','g:I {saw} (see) her yesterday.','g:She {has been|\'s been} (be) to Spain twice.','e:I *have seen>saw* him last week.','t:Lo vi ayer. = I saw him yesterday.|I saw it yesterday.','o:When did you start working here?']});

G({id:'1-12c',book:1,file:12,title:'Question forms (review)',es:'Repaso de preguntas',
form:[['q','be: Are you…? Where is…? Was it…?'],['q','present simple: Do you…? Does she…?'],['q','past simple: Did you…?'],['q','present perfect: Have you ever…?'],['q','going to: Are you going to…?'],['q','can: Can you…?']],
uses:['Orden general: (Wh-) + auxiliar + sujeto + verbo.'],
ex:[['Where did you grow up?','¿Dónde creciste?'],['How long have you lived here?','¿Cuánto tiempo has vivido aquí?'],['Can you play an instrument?','¿Sabes tocar un instrumento?']],
errs:[['Where you work?','Where do you work?','Falta auxiliar.'],['What you did yesterday?','What did you do yesterday?','Did + base.']],
items:['m:Where [did you go|you went|did you went] last summer?','m:[Have you ever|Did you ever|Are you ever] lost your keys?','m:What [are you going to|do you going to|you are going to] cook?','m:How old [is your sister|your sister is|does your sister]?','e:What *you did>did you do* yesterday?','e:*You can>Can you* swim?','t:¿Dónde creciste? = Where did you grow up?','o:What are you going to do tonight?','o:Can you play the guitar?']});
