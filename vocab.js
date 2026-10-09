/* ===== VOCABULARIO =====
   Cada línea: emoji|palabra|español|ejemplo|título Wikipedia (opcional; "-" = sin foto)
   photo:true → se busca foto usando el título o la palabra.
*/
const VOCAB = [
/* ---------- BASE (AEF 1, Files 1–6) ---------- */
{id:'v-countries',book:'B',file:1,title:'Countries & nationalities',es:'Países y nacionalidades',icon:'🌎',photo:false,w:`
🇺🇸|the United States – American|Estados Unidos – estadounidense|My teacher is American.
🇸🇻|El Salvador – Salvadoran|El Salvador – salvadoreño|I'm Salvadoran.
🇲🇽|Mexico – Mexican|México – mexicano|Tacos are Mexican.
🇬🇹|Guatemala – Guatemalan|Guatemala – guatemalteco|She's Guatemalan.
🇨🇦|Canada – Canadian|Canadá – canadiense|Toronto is in Canada.
🇧🇷|Brazil – Brazilian|Brasil – brasileño|Brazilian coffee is famous.
🇪🇸|Spain – Spanish|España – español|Paella is a Spanish dish.
🇬🇧|England – English|Inglaterra – inglés|London is in England.
🇫🇷|France – French|Francia – francés|He speaks French.
🇩🇪|Germany – German|Alemania – alemán|German cars are expensive.
🇮🇹|Italy – Italian|Italia – italiano|I love Italian food.
🇯🇵|Japan – Japanese|Japón – japonés|Sushi is Japanese.
🇨🇳|China – Chinese|China – chino|Chinese is difficult.
🇰🇷|South Korea – Korean|Corea del Sur – coreano|She watches Korean dramas.
🇨🇴|Colombia – Colombian|Colombia – colombiano|Shakira is Colombian.
🇦🇷|Argentina – Argentinian|Argentina – argentino|Messi is Argentinian.`},

{id:'v-classroom',book:'B',file:1,title:'Classroom & things',es:'Salón de clase y objetos',icon:'🎒',photo:true,w:`
🎒|backpack|mochila|My backpack is heavy.|Backpack
📖|book|libro|Open your book to page 8.
📓|notebook|cuaderno|Write it in your notebook.|Notebook
✏️|pencil|lápiz|Can I borrow a pencil?
🖊️|pen|bolígrafo|I need a blue pen.|Pen
📏|ruler|regla|Use a ruler.|Ruler
✂️|scissors|tijeras|Where are the scissors?
💻|laptop|laptop|My laptop is new.|Laptop
📱|cell phone|celular|Turn off your cell phone.|Mobile phone
🔑|keys|llaves|I can't find my keys.|Key (lock)
👛|wallet|billetera|My wallet is in my bag.|Wallet
👓|glasses|lentes|I wear glasses to read.|Glasses
☂️|umbrella|paraguas|Take an umbrella.
⌚|watch|reloj (de pulsera)|What a nice watch!|Watch
🪪|ID card|documento de identidad|Show me your ID card.|Identity document
🎧|headphones|audífonos|I study with headphones.
🗓️|calendar|calendario|Check the calendar.|Calendar
🪑|chair|silla|Sit on the chair.|Chair
🖍️|board|pizarra|Look at the board.|Whiteboard`},

{id:'v-jobs',book:'B',file:3,title:'Jobs',es:'Trabajos y profesiones',icon:'👩‍⚕️',photo:true,w:`
👩‍⚕️|doctor|doctor(a)|My cousin is a doctor.|Physician
🧑‍⚕️|nurse|enfermero(a)|The nurse is very kind.|Nursing
👨‍🏫|teacher|profesor(a)|Our teacher is from Ohio.|Teacher
👮|police officer|policía|The police officer helped us.|Police officer
👨‍🍳|chef / cook|chef / cocinero|He's a chef in a hotel.|Chef
🧑‍💼|manager|gerente|She's the manager of a bank.|-
👷|construction worker|obrero de construcción|My uncle is a construction worker.|Construction worker
🧑‍🔧|mechanic|mecánico|The mechanic fixed my car.|Mechanic
🧑‍💻|programmer|programador|Programmers work with computers.|Programmer
🧑‍🌾|farmer|agricultor|Farmers grow coffee.|Farmer
✈️|pilot|piloto|The pilot is talking.|Aircraft pilot
💇|hairdresser|peluquero(a)|I go to the hairdresser every month.|Hairdresser
🧑‍⚖️|lawyer|abogado(a)|She's a lawyer.|Lawyer
🦷|dentist|dentista|I hate going to the dentist.|Dentist
🛒|cashier|cajero(a)|The cashier gave me the change.|Cashier
🎨|painter|pintor(a)|Frida was a painter.|Painting
🏗️|engineer|ingeniero(a)|He's an engineer.|Engineer
🚕|taxi driver|taxista|The taxi driver was very fast.|Taxicab
🧳|receptionist|recepcionista|Ask the receptionist.|Receptionist
✍️|writer|escritor(a)|She's a famous writer.|Writer`},

{id:'v-family',book:'B',file:4,title:'Family',es:'La familia',icon:'👨‍👩‍👧',photo:false,w:`
👨|father / dad|padre / papá|My dad is 60.
👩|mother / mom|madre / mamá|My mom is a nurse.
👦|brother|hermano|I have two brothers.
👧|sister|hermana|My sister lives in the US.
👴|grandfather|abuelo|My grandfather was a farmer.
👵|grandmother|abuela|My grandmother makes great tamales.
🧔|uncle|tío|My uncle has a store.
👩‍🦱|aunt|tía|My aunt lives in San Miguel.
🧒|cousin|primo(a)|I have a lot of cousins.
👶|son / daughter|hijo / hija|Their daughter is three.
💑|husband / wife|esposo / esposa|Her husband is a lawyer.
👨‍👩‍👧‍👦|parents|padres|My parents live in Sonsonate.
🧑‍🍼|children / kids|hijos / niños|They have two children.
🙋|nephew / niece|sobrino / sobrina|My niece is very funny.
💍|boyfriend / girlfriend|novio / novia|His girlfriend is Mexican.`},

{id:'v-routine',book:'B',file:4,title:'Daily routine',es:'Rutina diaria',icon:'⏰',photo:false,w:`
⏰|wake up|despertarse|I wake up at 5:30.
🛏️|get up|levantarse|I get up at 6.
🚿|take a shower|bañarse|I take a shower in the morning.
🪥|brush your teeth|cepillarse los dientes|Brush your teeth after lunch.
👔|get dressed|vestirse|I get dressed quickly.
🍳|have breakfast|desayunar|I have breakfast at home.
🚌|go to work|ir al trabajo|I go to work by bus.
🥪|have lunch|almorzar|We have lunch at 12.
🏠|get home|llegar a casa|I get home at 7.
🍽️|have dinner|cenar|We have dinner together.
📺|watch TV|ver televisión|I watch TV after dinner.
😴|go to bed|irse a dormir|I go to bed at 11.
🧹|do housework|hacer quehaceres|I do housework on Saturdays.
🏋️|go to the gym|ir al gimnasio|She goes to the gym every day.
📚|do homework|hacer tarea|My kids do homework in the evening.`},

{id:'v-time',book:'B',file:4,title:'Days, months & time',es:'Días, meses y hora',icon:'📅',photo:false,w:`
📅|Monday|lunes|I have class on Monday.
📅|Tuesday|martes|See you on Tuesday.
📅|Wednesday|miércoles|Wednesday is my busy day.
📅|Thursday|jueves|We have English on Thursday.
📅|Friday|viernes|Thank God it's Friday!
🎉|Saturday|sábado|On Saturday I relax.
☀️|Sunday|domingo|On Sunday we visit my mom.
❄️|January|enero|It's cold in January in New York.
💘|February|febrero|Valentine's Day is in February.
🌸|April|abril|Easter is in March or April.
🇸🇻|September|septiembre|Independence Day is in September.
🎃|October|octubre|Halloween is in October.
🎄|December|diciembre|Christmas is in December.
🕗|half past eight|ocho y media|The class starts at half past eight.
🕘|quarter to nine|cuarto para las nueve|It's a quarter to nine.
🕒|quarter after three|tres y cuarto|I leave at a quarter after three.`},

{id:'v-weather',book:'B',file:5,title:'Weather & seasons',es:'Clima y estaciones',icon:'🌦️',photo:true,w:`
☀️|sunny|soleado|It's sunny today.|Sunlight
🌧️|rainy / raining|lluvioso / lloviendo|It's raining a lot.|Rain
☁️|cloudy|nublado|It's cloudy this morning.|Cloud
🌬️|windy|ventoso|It's windy at the beach.|Wind
❄️|snowing|nevando|It's snowing in Chicago.|Snow
🌫️|foggy|con neblina|It's foggy in the mountains.|Fog
🔥|hot|caliente / calor|It's very hot in April.|-
🧊|cold|frío|It's cold in the morning.
🌤️|warm|templado|It's warm in the evening.|-
⛈️|storm|tormenta|There was a big storm last night.|Thunderstorm
🌸|spring|primavera|Spring is beautiful in Japan.|Spring (season)
🏖️|summer|verano|In the summer we go to the beach.|Summer
🍂|fall / autumn|otoño|The leaves fall in the fall.|Autumn
⛄|winter|invierno|Winter in Canada is very cold.|Winter`},

{id:'v-adjectives',book:'B',file:2,title:'Common adjectives',es:'Adjetivos comunes',icon:'🔤',photo:false,w:`
🐘|big|grande|It's a big house.
🐜|small|pequeño|My room is small.
👴|old|viejo / antiguo|It's a very old church.
🆕|new|nuevo|I have a new phone.
🧒|young|joven|My boss is young.
💸|expensive|caro|That restaurant is expensive.
🪙|cheap|barato|This shirt was cheap.
🏎️|fast|rápido|It's a fast car.
🐢|slow|lento|The internet is slow.
😍|beautiful|hermoso|What a beautiful beach!
😖|ugly|feo|That building is ugly.
✅|easy|fácil|The test was easy.
🧩|difficult|difícil|English pronunciation is difficult.
📏|long|largo|It was a long day.
✂️|short|corto / bajo|She has short hair.
🌟|good|bueno|It's a good idea.
👎|bad|malo|The weather is bad.
🤩|interesting|interesante|It's an interesting book.
🥱|boring|aburrido|The movie was boring.
💪|strong|fuerte|He's very strong.
😊|happy|feliz|I'm happy today.
😢|sad|triste|Why are you sad?`},

{id:'v-music-free',book:'B',file:6,title:'Free time & verb phrases',es:'Tiempo libre y frases verbales',icon:'🎸',photo:false,w:`
🎸|play the guitar|tocar la guitarra|I play the guitar.
⚽|play soccer|jugar fútbol|We play soccer on Sundays.
🎶|listen to music|escuchar música|I listen to music on the bus.
💃|go dancing|ir a bailar|We go dancing on Fridays.
🏃|go running|salir a correr|I go running in the morning.
🍿|go to the movies|ir al cine|Let's go to the movies.
🛍️|go shopping|ir de compras|She loves going shopping.
🍳|cook|cocinar|My husband loves cooking.
📖|read|leer|I read before bed.
🏊|swim|nadar|Can you swim?
🎮|play video games|jugar videojuegos|My son plays video games all day.
☕|meet friends|reunirse con amigos|I meet friends on Saturdays.
📸|take photos|tomar fotos|I take a lot of photos.
🚲|ride a bike|andar en bicicleta|I ride my bike to work.
🎤|sing|cantar|She sings very well.`},

/* ---------- A1++ (AEF 1, Files 7–12) ---------- */
{id:'v-wordform',book:1,file:7,title:'Word formation: jobs',es:'Formación de palabras (verbo → persona)',icon:'🎨',photo:false,w:`
🎨|paint → painter|pintar → pintor|Picasso was a painter.
✍️|write → writer|escribir → escritor|Gabriel García Márquez was a writer.
🎤|sing → singer|cantar → cantante|She's a famous singer.
🎻|music → musician|música → músico|My brother is a musician.
🔬|science → scientist|ciencia → científico|Einstein was a scientist.
🧑‍🔬|invent → inventor|inventar → inventor|Edison was an inventor.
🎭|act → actor|actuar → actor|He's a great actor.
⚽|play soccer → soccer player|jugar fútbol → futbolista|Messi is a soccer player.
🎬|direct → director|dirigir → director|Spielberg is a famous director.
🏛️|politics → politician|política → político|She's a politician.
🎼|compose → composer|componer → compositor|Mozart was a composer.
🏃|run → runner|correr → corredor|He's a fast runner.`},

{id:'v-gohaveget',book:1,file:7,title:'go, have, get',es:'Expresiones con go, have y get',icon:'🧭',photo:false,w:`
🏖️|go to the beach|ir a la playa|We went to the beach on Sunday.
🛌|go to bed early|acostarse temprano|I went to bed early last night.
🍽️|go out for dinner|salir a cenar|We went out for dinner.
🚶|go for a walk|salir a caminar|Let's go for a walk.
☕|have a coffee|tomarse un café|Let's have a coffee.
🎉|have a good time|pasarla bien|We had a good time.
🤒|have a cold|tener gripe|I have a cold.
🚿|have a shower|bañarse|I had a quick shower.
📩|get an email|recibir un correo|I got an email from my boss.
🚕|get a taxi|tomar un taxi|We got a taxi to the airport.
🏠|get home|llegar a casa|What time did you get home?
📰|get up late|levantarse tarde|I got up late on Saturday.
🗺️|get lost|perderse|We got lost in the city.
🎫|get tickets|conseguir boletos|I got tickets for the concert.`},

{id:'v-house',book:1,file:8,title:'The house',es:'La casa: cuartos y muebles',icon:'🏠',photo:true,w:`
🛋️|living room|sala|We watch TV in the living room.|Living room
🍳|kitchen|cocina|My mom is in the kitchen.|Kitchen
🛏️|bedroom|dormitorio|My bedroom is small.|Bedroom
🛁|bathroom|baño|The bathroom is upstairs.|Bathroom
🍽️|dining room|comedor|We eat in the dining room.|Dining room
🚗|garage|garaje|The car is in the garage.|Garage (residential)
🌳|yard / backyard|patio / jardín|The kids play in the backyard.|Backyard
🪜|stairs|escaleras|Go up the stairs.|Stairs
🛋️|sofa / couch|sofá|The sofa is very comfortable.|Couch
🛏️|bed|cama|Make your bed!|Bed
🪞|mirror|espejo|There's a mirror in the bathroom.|Mirror
🚪|door|puerta|Close the door, please.|Door
🪟|window|ventana|Open the window.|Window
🧊|refrigerator / fridge|refrigeradora|The milk is in the fridge.|Refrigerator
🔥|stove|cocina (estufa)|The stove is gas.|Kitchen stove
🚿|shower|ducha|The shower is broken.|Shower
🪴|plant|planta|There are some plants on the balcony.|Houseplant
💡|lamp|lámpara|Turn on the lamp.|Light fixture
🗄️|closet|clóset|My clothes are in the closet.|Closet
🧺|washing machine|lavadora|We need a new washing machine.|Washing machine
📺|television|televisor|There's a TV in the bedroom.|Television set
🖼️|picture|cuadro|There's a picture on the wall.|Painting`},

{id:'v-prep',book:1,file:8,title:'Prepositions of place & movement',es:'Preposiciones de lugar y movimiento',icon:'📍',photo:false,w:`
📥|in|dentro de|The keys are in my bag.
🔝|on|sobre (tocando)|The book is on the table.
⬇️|under|debajo de|The cat is under the bed.
↔️|next to|al lado de|The bank is next to the pharmacy.
🔀|between|entre|The café is between the bank and the park.
🔁|opposite / across from|enfrente de|The school is opposite the church.
🔙|behind|detrás de|The garage is behind the house.
🔜|in front of|delante de|There's a tree in front of my house.
⬆️|above|arriba de|There's a picture above the sofa.
↗️|up|hacia arriba|Walk up the stairs.
↘️|down|hacia abajo|Go down the street.
🌉|across|a través / al otro lado|Walk across the bridge.
🔄|around|alrededor|We walked around the lake.`},

{id:'v-food',book:1,file:9,title:'Food',es:'Comida',icon:'🍎',photo:true,w:`
🍎|apple|manzana|I eat an apple every day.|Apple
🍌|banana|guineo / banano|Bananas are cheap here.|Banana
🍊|orange|naranja|I'd like an orange juice.|Orange (fruit)
🍓|strawberries|fresas|I love strawberries with cream.|Strawberry
🍇|grapes|uvas|We eat 12 grapes on New Year's Eve.|Grape
🥭|mango|mango|Green mango with salt is delicious.|Mango
🍍|pineapple|piña|Pineapple is my favorite fruit.|Pineapple
🍞|bread|pan|Is there any bread?|Bread
🧀|cheese|queso|Pupusas with cheese, please.|Cheese
🥚|eggs|huevos|I have eggs for breakfast.|Egg as food
🍚|rice|arroz|We eat rice and beans.|Rice
🫘|beans|frijoles|Fried beans are typical here.|Bean
🍗|chicken|pollo|Chicken with rice, please.|Chicken as food
🥩|meat|carne|I don't eat a lot of meat.|Meat
🐟|fish|pescado|We had fish at the beach.|Fish as food
🍝|pasta|pasta|Pasta is easy to cook.|Pasta
🥔|potatoes|papas|French fries are made from potatoes.|Potato
🍅|tomatoes|tomates|Can you buy some tomatoes?|Tomato
🧅|onions|cebollas|Onions make me cry.|Onion
🥕|carrots|zanahorias|Carrots are good for your eyes.|Carrot
🥬|lettuce|lechuga|A salad with lettuce and tomato.|Lettuce
🥛|milk|leche|There isn't any milk.|Milk
🧈|butter|mantequilla|Bread with butter.|Butter
🍬|candy|dulces|Kids love candy.|Candy
🍪|cookies|galletas|Don't eat all the cookies!|Cookie
🍰|cake|pastel|Happy birthday! Here's your cake.|Cake
🍦|ice cream|helado|I'd like a chocolate ice cream.|Ice cream
🍯|sugar|azúcar|No sugar, thanks.|Sugar
🧂|salt|sal|Pass me the salt, please.|Salt
☕|coffee|café|Salvadoran coffee is excellent.|Coffee
🫖|tea|té|Would you like some tea?|Tea
🧃|juice|jugo|An orange juice, please.|Juice
💧|water|agua|Drink more water.|Drinking water
🥪|sandwich|sándwich|I have a sandwich for lunch.|Sandwich`},

{id:'v-containers',book:1,file:9,title:'Food containers',es:'Envases de comida',icon:'🥫',photo:true,w:`
🥫|a can of tuna|una lata de atún|Buy a can of tuna.|Tin can
🍾|a bottle of water|una botella de agua|A bottle of water, please.|Bottle
🫙|a jar of jam|un frasco de mermelada|There's a jar of jam in the fridge.|Jar
📦|a box of cereal|una caja de cereal|A box of cereal costs $4.|Box
🛍️|a bag of chips|una bolsa de papitas|I ate a whole bag of chips!|Plastic bag
🥛|a carton of milk|un cartón de leche|We need a carton of milk.|Carton
🍫|a bar of chocolate|una barra de chocolate|I'd like a bar of chocolate.|Chocolate bar
🎁|a package of cookies|un paquete de galletas|A package of cookies, please.|-
☕|a cup of coffee|una taza de café|A cup of coffee, please.|Cup
🍞|a loaf of bread|una barra de pan|Can you buy a loaf of bread?|Loaf
🍕|a slice of pizza|una porción de pizza|I had a slice of pizza.|Pizza`},

{id:'v-city',book:1,file:10,title:'Places & buildings',es:'Lugares y edificios de la ciudad',icon:'🏙️',photo:true,w:`
🏦|bank|banco|The bank opens at 9.|Bank
💊|pharmacy|farmacia|Is there a pharmacy near here?|Pharmacy
🏥|hospital|hospital|She works at a hospital.|Hospital
🏫|school|escuela|My kids go to that school.|School
⛪|church|iglesia|There's a church in the main square.|Church (building)
🏛️|museum|museo|The museum is closed on Mondays.|Museum
🛒|supermarket|supermercado|I go to the supermarket on Saturdays.|Supermarket
🏬|mall / shopping center|centro comercial|Let's go to the mall.|Shopping mall
🅿️|parking lot|parqueo|The parking lot is full.|Parking lot
🌳|park|parque|Let's go to the park.|Park
🏨|hotel|hotel|We stayed in a nice hotel.|Hotel
🚉|train station|estación de tren|Where's the train station?|Train station
🚏|bus stop|parada de bus|Wait at the bus stop.|Bus stop
🏟️|stadium|estadio|The stadium was full.|Stadium
📚|library|biblioteca|I study at the library.|Library
🏤|post office|oficina de correos|The post office is closed.|Post office
🎭|theater|teatro|We went to the theater.|Theatre
🌉|bridge|puente|They built a new bridge.|Bridge
🏰|castle|castillo|We visited an old castle.|Castle
🍴|restaurant|restaurante|It's the best restaurant in town.|Restaurant
⛽|gas station|gasolinera|Stop at the gas station.|Filling station
🏢|office building|edificio de oficinas|I work in a big office building.|Office`},

{id:'v-vacations',book:1,file:10,title:'Vacations',es:'Vacaciones',icon:'🏝️',photo:true,w:`
🏝️|go to the beach|ir a la playa|We're going to go to the beach.|Beach
⛺|go camping|ir a acampar|We went camping in the mountains.|Camping
📸|go sightseeing|hacer turismo|We went sightseeing in Antigua.|Tourism
🌞|sunbathe|tomar el sol|I sunbathed all day.|Sun tanning
🧳|pack your suitcase|hacer la maleta|Don't forget to pack your suitcase.|Suitcase
🏨|stay in a hotel|quedarse en un hotel|We stayed in a hotel by the sea.|Hotel
🚗|rent a car|rentar un carro|We rented a car in Miami.|Car rental
🗺️|travel abroad|viajar al extranjero|I want to travel abroad.|-
🏔️|go to the mountains|ir a las montañas|We went to the mountains.|Mountain
🛶|go kayaking|ir en kayak|We went kayaking on the lake.|Kayak
🎟️|buy souvenirs|comprar recuerdos|I bought souvenirs for my family.|-
✈️|take a flight|tomar un vuelo|We took a flight to Cancún.|Airliner`},

{id:'v-internet',book:1,file:11,title:'Technology & the Internet',es:'Tecnología e internet',icon:'🌐',photo:false,w:`
📲|download|descargar|Download the app.
📤|upload|subir (archivo)|Upload the photo.
🔐|password|contraseña|I forgot my password.
🔍|search|buscar|Search on Google.
💬|send a message|enviar un mensaje|Send me a message.
📧|email|correo electrónico|Check your email.
🖱️|click|hacer clic|Click on the link.
📶|Wi-Fi|wifi|What's the Wi-Fi password?
🔋|charge your phone|cargar el teléfono|I need to charge my phone.
🌐|website|sitio web|Look at the website.
📹|video call|videollamada|We had a video call.
👍|post|publicar|She posts photos every day.`},

/* ---------- A2 (AEF 2) ---------- */
{id:'v-appearance',book:2,file:1,title:'Describing people: appearance',es:'Describir personas: apariencia',icon:'🧑',photo:false,w:`
📏|tall|alto|My brother is very tall.
🧍|short|bajo|She's short and slim.
🧍‍♀️|slim / thin|delgado|He's thin.
🫃|overweight|con sobrepeso|My cat is a little overweight.
💪|muscular|musculoso|He's very muscular.
👱|blond hair|pelo rubio|She has blond hair.
👩‍🦱|curly hair|pelo rizado|My daughter has curly hair.
💁|straight hair|pelo liso|He has straight black hair.
👨‍🦰|red hair|pelo pelirrojo|She has red hair.
👨‍🦲|bald|calvo|My dad is bald.
🧔|beard|barba|He has a long beard.
👨|mustache|bigote|My grandpa has a mustache.
👀|dark eyes|ojos oscuros|She has big dark eyes.
🧓|middle-aged|de mediana edad|He's middle-aged.
😎|good-looking|guapo / atractivo|Her boyfriend is very good-looking.`},

{id:'v-personality',book:2,file:1,title:'Personality',es:'Personalidad',icon:'😊',photo:false,w:`
😊|friendly|amigable|My neighbors are very friendly.
🤝|kind|amable|She's very kind to everybody.
😁|funny|chistoso|He's really funny.
🙈|shy|tímido|My son is very shy.
🗣️|talkative|hablador|My sister is very talkative.
🎁|generous|generoso|My grandfather is very generous.
💰|stingy / cheap|tacaño|He never pays. He's so stingy!
🦁|brave|valiente|You're very brave.
😤|unfriendly|antipático|The waiter was unfriendly.
🛋️|lazy|perezoso|My cat is lazy.
🐝|hard-working|trabajador|She's very hard-working.
🧠|smart / intelligent|inteligente|You're very smart.
😌|calm|tranquilo|He's always calm.
😠|bad-tempered|de mal genio|My boss is bad-tempered.
🙄|serious|serio|Why are you so serious?
😇|patient|paciente|Teachers need to be patient.
😏|selfish|egoísta|Don't be selfish.
🎉|extroverted|extrovertido|She's very extroverted.`},

{id:'v-clothes',book:2,file:1,title:'Clothes',es:'Ropa',icon:'👕',photo:true,w:`
👕|T-shirt|camiseta|I'm wearing a white T-shirt.|T-shirt
👔|shirt|camisa|He wears a shirt to work.|Shirt
👖|jeans|jeans|I love these jeans.|Jeans
👗|dress|vestido|What a beautiful dress!|Dress
🩳|shorts|shorts|It's hot. Wear shorts.|-
👚|blouse|blusa|She's wearing a pink blouse.|Blouse
🧥|jacket|chaqueta|Take a jacket.|Jacket
🧶|sweater|suéter|This sweater is very warm.|Sweater
👟|sneakers|tenis|I need new sneakers.|Sneakers
👞|shoes|zapatos|These shoes are comfortable.|Shoe
👢|boots|botas|She has black boots.|Boot
👠|high heels|tacones|I can't walk in high heels.|High-heeled shoe
🧢|cap|gorra|He always wears a cap.|Baseball cap
🎩|hat|sombrero|Nice hat!|Hat
🧣|scarf|bufanda|Take a scarf. It's cold.|Scarf
🧤|gloves|guantes|Wear gloves in the snow.|Glove
🧦|socks|calcetines|I can't find my socks.|Sock
👜|bag / purse|bolso / cartera|Her bag is very expensive.|Handbag
🤵|suit|traje|He wears a suit to work.|Suit
👘|skirt|falda|She's wearing a long skirt.|Skirt
👙|swimsuit|traje de baño|Don't forget your swimsuit.|Swimsuit
🕶️|sunglasses|lentes de sol|I need my sunglasses.|Sunglasses
🪢|tie|corbata|You don't need a tie.|Necktie
💍|ring|anillo|What a beautiful ring!|Ring (jewellery)`},

{id:'v-verbphrases2',book:2,file:2,title:'Verb phrases (stories)',es:'Frases verbales para historias',icon:'📖',photo:false,w:`
👀|look for|buscar|I'm looking for my keys.
⏳|wait for|esperar a|I waited for an hour.
📞|call back|devolver la llamada|Can you call me back?
🚪|arrive at / in|llegar a|We arrived in Miami at 6.
💭|think about|pensar en|I'm thinking about you.
😟|worry about|preocuparse por|Don't worry about it.
🗣️|talk to|hablar con|I talked to my boss.
🎧|listen to|escuchar|Listen to me!
🙋|ask for|pedir|He asked for the check.
💸|pay for|pagar por|I paid for dinner.
🔁|depend on|depender de|It depends on the weather.
🏃|run away|huir|The dog ran away.`},

{id:'v-airport',book:2,file:3,title:'Airports',es:'El aeropuerto',icon:'✈️',photo:true,w:`
🎫|boarding pass|pase de abordar|Show your boarding pass.|Boarding pass
🛂|passport control|control de pasaportes|Go to passport control.|Border control
🧳|check in|registrarse (check-in)|We checked in online.|Airport check-in
🛃|customs|aduana|We went through customs.|Customs
🚪|gate|puerta de embarque|Our flight leaves from gate 12.|Airport terminal
🛫|departures|salidas|Departures are on the second floor.|-
🛬|arrivals|llegadas|I'll wait for you in arrivals.|-
🛄|baggage claim|reclamo de equipaje|Get your bags at baggage claim.|Baggage reclaim
🔎|security|seguridad|Go through security.|Airport security
⏱️|delayed|retrasado|Our flight is delayed.|-
🛩️|take off|despegar|The plane took off on time.|Takeoff
🛬|land|aterrizar|We landed in New York.|Landing
💼|carry-on bag|equipaje de mano|I only have a carry-on bag.|Hand luggage
🪪|passport|pasaporte|Don't forget your passport.|Passport
✈️|flight|vuelo|How was your flight?|Airliner`},

{id:'v-paraphrase',book:2,file:3,title:'Paraphrasing',es:'Explicar palabras (paraphrasing)',icon:'💬',photo:false,w:`
🧑|It's somebody who…|Es alguien que…|It's somebody who works in a hospital.
📦|It's something which/that…|Es algo que…|It's something which you use to cut.
📍|It's a place where…|Es un lugar donde…|It's a place where you buy medicine.
🔤|It's like a…|Es como un…|It's like a big cup.
🙃|It's the opposite of…|Es lo opuesto a…|It's the opposite of "cheap".
🧪|It's a kind of…|Es un tipo de…|It's a kind of fruit.
🛠️|You use it to…|Lo usas para…|You use it to open bottles.
❓|What's the word for…?|¿Cómo se dice…?|What's the word for "tijeras"?`},

{id:'v-housework',book:2,file:4,title:'Housework, make or do',es:'Quehaceres: make o do',icon:'🧹',photo:false,w:`
🛏️|make the bed|tender la cama|I make my bed every morning.
🍲|make dinner|hacer la cena|My husband makes dinner.
🧺|do the laundry|lavar la ropa|I do the laundry on Saturdays.
🍽️|do the dishes|lavar los platos|It's your turn to do the dishes.
👕|do the ironing|planchar|I hate doing the ironing.
🧹|sweep the floor|barrer|Sweep the floor, please.
🧽|clean the bathroom|limpiar el baño|Who cleaned the bathroom?
🗑️|take out the garbage|sacar la basura|Take out the garbage tonight.
🛒|do the shopping|hacer las compras|I do the shopping online.
👚|put away your clothes|guardar la ropa|Put away your clothes!
🧼|vacuum|aspirar|I vacuumed the living room.
📞|make a phone call|hacer una llamada|I need to make a phone call.
❌|make a mistake|cometer un error|Everybody makes mistakes.
📚|do homework|hacer la tarea|Did you do your homework?
🏋️|do exercise|hacer ejercicio|I do exercise three times a week.
💵|make money|ganar dinero|He makes a lot of money.
🤝|make friends|hacer amigos|It's easy to make friends here.
🙏|do a favor|hacer un favor|Can you do me a favor?
💬|make a noise|hacer ruido|Don't make a noise!
📝|do a test|presentar un examen|We did a test yesterday.`},

{id:'v-shopping',book:2,file:4,title:'Shopping',es:'De compras',icon:'🛍️',photo:false,w:`
👗|try on|probarse|Can I try on this dress?
📐|fit|quedar (talla)|These jeans don't fit me.
🔢|size|talla|What size are you?
🏷️|on sale|en oferta|These shoes are on sale.
🧾|receipt|recibo|Keep the receipt.
🔁|return|devolver|I want to return this shirt.
💵|refund|reembolso|Can I get a refund?
💳|pay by card|pagar con tarjeta|Can I pay by card?
🛒|checkout|caja (pago)|Go to the checkout.
📦|order online|pedir en línea|I ordered it online.
🚚|deliver|entregar|They deliver in 24 hours.
🏪|store|tienda|The store opens at 10.
🪞|fitting room|probador|Where's the fitting room?
💰|cost|costar|How much does it cost?`},

{id:'v-edging',book:2,file:4,title:'-ed / -ing adjectives',es:'Adjetivos con -ed y -ing',icon:'😮',photo:false,w:`
🥱|bored / boring|aburrido (siento) / aburrido (es)|The class was boring, so I was bored.
😴|tired / tiring|cansado / cansador|It was a tiring day. I'm tired.
🤔|interested / interesting|interesado / interesante|I'm interested in history. It's interesting.
😲|surprised / surprising|sorprendido / sorprendente|I was surprised. It was surprising news.
😨|frightened / frightening|asustado / aterrador|The movie was frightening.
😕|confused / confusing|confundido / confuso|The instructions were confusing.
🤩|excited / exciting|emocionado / emocionante|I'm excited about the trip.
😞|disappointed / disappointing|decepcionado / decepcionante|The food was disappointing.
😳|embarrassed / embarrassing|avergonzado / vergonzoso|It was so embarrassing!
😌|relaxed / relaxing|relajado / relajante|A relaxing vacation.
😩|depressed / depressing|deprimido / deprimente|The weather is depressing.
😠|annoyed / annoying|molesto / molesto (irritante)|That noise is annoying.`},

{id:'v-timeexp',book:2,file:5,title:'Time expressions',es:'Expresiones con time',icon:'⏳',photo:false,w:`
⌛|spend time|pasar tiempo|I spend a lot of time with my kids.
🗑️|waste time|perder tiempo|Don't waste time on your phone.
💾|save time|ahorrar tiempo|The new road saves time.
🎯|on time|a tiempo (puntual)|The bus arrived on time.
🏁|in time|a tiempo (antes del límite)|We got there just in time.
🕐|have time|tener tiempo|I don't have time to cook.
😅|in a hurry|de prisa|Sorry, I'm in a hurry.
⏳|take time|tomar tiempo|Learning English takes time.`},

{id:'v-towncity',book:2,file:5,title:'Describing a town or city',es:'Describir una ciudad',icon:'🌆',photo:false,w:`
👥|crowded|abarrotado|The market is always crowded.
🏭|polluted|contaminado|Big cities are often polluted.
🔊|noisy|ruidoso|My street is very noisy.
🤫|quiet|tranquilo|It's a quiet town.
🛡️|safe|seguro|Is this area safe?
⚠️|dangerous|peligroso|That road is dangerous.
🎢|exciting|emocionante|New York is an exciting city.
🏛️|historic|histórico|Antigua is a historic city.
🧼|clean|limpio|The streets are very clean.
🗑️|dirty|sucio|The river is dirty.
🌃|lively|animado|The center is lively at night.
💤|boring|aburrido|My town is a bit boring.
🌄|beautiful|hermoso|It's a beautiful city.
🌇|modern|moderno|It's a very modern city.`},

{id:'v-body',book:2,file:5,title:'Health & the body',es:'Salud y el cuerpo',icon:'🫀',photo:false,w:`
🧠|head|cabeza|I have a headache.
👁️|eye|ojo|My eyes are tired.
👂|ear|oreja / oído|I have an earache.
👃|nose|nariz|My nose is red.
👄|mouth|boca|Open your mouth.
🦷|tooth / teeth|diente / dientes|I have a toothache.
🦴|back|espalda|My back hurts.
✋|hand|mano|Wash your hands.
🦵|leg|pierna|I broke my leg.
🦶|foot / feet|pie / pies|My feet hurt.
💪|arm|brazo|He hurt his arm.
🫀|heart|corazón|Exercise is good for your heart.
🫁|lungs|pulmones|Smoking is bad for your lungs.
🤕|headache|dolor de cabeza|I have a terrible headache.
🤧|cold / flu|gripe|I have the flu.
🌡️|fever / temperature|fiebre|She has a fever.
😷|sore throat|dolor de garganta|I have a sore throat.
🤢|stomachache|dolor de estómago|I ate too much. I have a stomachache.
🥗|healthy|saludable|I eat healthy food.
💊|medicine|medicina|Take this medicine twice a day.`},

{id:'v-opposites',book:2,file:6,title:'Opposite verbs',es:'Verbos opuestos',icon:'↔️',photo:false,w:`
🏆|win ↔ lose|ganar ↔ perder|We won! They lost.
✅|pass ↔ fail|aprobar ↔ reprobar|I passed the exam. He failed.
🧠|remember ↔ forget|recordar ↔ olvidar|Don't forget to call!
🚪|push ↔ pull|empujar ↔ halar|Push the door, don't pull it.
🛒|buy ↔ sell|comprar ↔ vender|I sold my old car.
👨‍🏫|teach ↔ learn|enseñar ↔ aprender|She teaches; we learn.
🔛|turn on ↔ turn off|encender ↔ apagar|Turn off the lights.
🏁|start ↔ finish|empezar ↔ terminar|The class starts at 6.
🎁|give ↔ take|dar ↔ tomar|Take one, give one.
📈|go up ↔ go down|subir ↔ bajar|Prices went up.
🔓|open ↔ close|abrir ↔ cerrar|Open the window.
💸|lend ↔ borrow|prestar ↔ pedir prestado|Can you lend me $5?
🏃|arrive ↔ leave|llegar ↔ salir|What time do you leave?
😊|agree ↔ disagree|estar de acuerdo ↔ en desacuerdo|I agree with you.`},

{id:'v-adjprep',book:2,file:6,title:'Adjectives + prepositions',es:'Adjetivos + preposiciones',icon:'🔗',photo:false,w:`
😨|afraid of|tener miedo de|I'm afraid of spiders.
🎯|good at|bueno en|She's good at math.
👎|bad at|malo en|I'm bad at cooking.
🤔|interested in|interesado en|I'm interested in history.
💍|married to|casado con|She's married to an American.
🔀|different from|diferente de|My sister is very different from me.
😠|angry with / about|enojado con / por|He's angry with me.
🤩|excited about|emocionado por|I'm excited about the trip.
😴|tired of|cansado de|I'm tired of waiting.
🍀|lucky to|afortunado de|I'm lucky to have you.
❤️|crazy about|loco por|He's crazy about soccer.
😊|famous for|famoso por|El Salvador is famous for pupusas.`},

{id:'v-verbsinf',book:2,file:7,title:'Verbs + infinitive / -ing',es:'Verbos con to o -ing',icon:'➡️',photo:false,w:`
🎯|decide to|decidir|I decided to study English.
🙏|hope to|esperar (tener esperanza)|I hope to see you soon.
🤞|promise to|prometer|He promised to come.
🧪|try to|intentar|Try to relax.
📅|plan to|planear|We plan to travel.
🔑|need to|necesitar|I need to sleep.
🙃|forget to|olvidar|I forgot to call you.
🧑‍🎓|learn to|aprender a|I'm learning to drive.
😊|enjoy -ing|disfrutar|I enjoy cooking.
🙂|don't mind -ing|no me molesta|I don't mind waiting.
🛑|stop -ing|dejar de|Stop talking!
🏁|finish -ing|terminar de|Have you finished eating?
🙅|feel like -ing|tener ganas de|I don't feel like going out.
🗓️|spend time -ing|pasar tiempo|I spend time reading.`},

{id:'v-modifiers',book:2,file:7,title:'Modifiers',es:'Modificadores (intensidad)',icon:'🎚️',photo:false,w:`
🤏|a little / a bit|un poco|I'm a little tired.
🙂|quite|bastante|It's quite cold today.
👍|pretty|bastante (informal)|The food was pretty good.
💯|really|realmente / muy|It's really expensive.
⭐|very|muy|She's very nice.
🚀|incredibly|increíblemente|He's incredibly smart.
🫤|not very|no muy|It's not very far.
🔥|extremely|extremadamente|It's extremely hot.`},

{id:'v-get',book:2,file:8,title:'get',es:'Usos de get',icon:'🎯',photo:false,w:`
💼|get a job|conseguir trabajo|She got a job at a bank.
📩|get a message|recibir un mensaje|I got your message.
🏠|get home|llegar a casa|I got home late.
😴|get tired|cansarse|I get tired easily.
💍|get married|casarse|They got married in 2015.
🩹|get better|mejorar|I hope you get better soon.
😡|get angry|enojarse|Don't get angry.
🌑|get dark|oscurecer|It gets dark at 6.
🚌|get on / off the bus|subirse / bajarse del bus|Get off at the next stop.
👗|get dressed|vestirse|Get dressed, we're late!
🗺️|get lost|perderse|We got lost in Guatemala City.
📈|get older|envejecer|We're getting older.
🔄|get up|levantarse|I got up at 5.
🤝|get along with|llevarse bien con|I get along with my boss.`},

{id:'v-confusing',book:2,file:8,title:'Confusing verbs',es:'Verbos que se confunden',icon:'🤯',photo:false,w:`
💵|borrow|pedir prestado|Can I borrow your pen?
🤲|lend|prestar|Can you lend me your pen?
🏆|win|ganar (un premio, partido)|We won the game.
💰|earn|ganar (dinero trabajando)|She earns $1,000 a month.
🧠|know|conocer / saber|I know her very well.
🤝|meet|conocer (por primera vez)|I met him at a party.
👀|look|verse|You look tired.
🪞|look like|parecerse a|She looks like her mom.
🎒|carry|cargar / llevar|Can you carry this box?
👗|wear|llevar puesto|She's wearing a red dress.
🙏|hope|esperar (desear)|I hope you're OK.
⏳|wait|esperar (tiempo)|Wait for me!
🙊|say|decir (algo)|She said hello.
🗣️|tell|decir (a alguien)|Tell me the truth.
🚶|bring|traer|Bring your book.
🏃|take|llevar|Take an umbrella.`},

{id:'v-animals',book:2,file:9,title:'Animals',es:'Animales',icon:'🐾',photo:true,w:`
🐶|dog|perro|My dog is very friendly.|Dog
🐱|cat|gato|The cat is sleeping.|Cat
🐴|horse|caballo|Can you ride a horse?|Horse
🐄|cow|vaca|Cows give milk.|Cattle
🐷|pig|cerdo|The pig is in the mud.|Pig
🐔|chicken|gallina|We have chickens in the yard.|Chicken
🐑|sheep|oveja|There are sheep on the hill.|Sheep
🐐|goat|cabra|Goats eat everything.|Goat
🐭|mouse|ratón|There's a mouse in the kitchen!|Mouse
🐀|rat|rata|I hate rats.|Rat
🐍|snake|serpiente|Be careful! A snake!|Snake
🕷️|spider|araña|There's a spider on the wall.|Spider
🐝|bee|abeja|A bee stung me.|Bee
🦋|butterfly|mariposa|What a beautiful butterfly.|Butterfly
🦟|mosquito|zancudo|Mosquitoes love me.|Mosquito
🐻|bear|oso|We saw a bear in the forest.|Bear
🦁|lion|león|The lion is the king of the jungle.|Lion
🐯|tiger|tigre|Tigers are in danger.|Tiger
🐘|elephant|elefante|Elephants never forget.|Elephant
🦒|giraffe|jirafa|Giraffes are very tall.|Giraffe
🐒|monkey|mono|Monkeys are funny.|Monkey
🦈|shark|tiburón|There are sharks near the beach.|Shark
🐬|dolphin|delfín|We saw dolphins!|Dolphin
🐢|turtle|tortuga|Turtles lay eggs on the beach.|Sea turtle
🐊|crocodile|cocodrilo|There are crocodiles in the river.|Crocodile
🦅|eagle|águila|The eagle is the symbol of the US.|Eagle
🦜|parrot|loro|Our parrot can talk.|Parrot
🐜|ant|hormiga|There are ants in the sugar.|Ant`},

{id:'v-phobias',book:2,file:9,title:'Phobias & fears',es:'Fobias y miedos',icon:'😱',photo:false,w:`
🏔️|heights|alturas|I'm afraid of heights.
🕷️|spiders|arañas|She's terrified of spiders.
🐍|snakes|serpientes|I'm scared of snakes.
✈️|flying|volar|He's afraid of flying.
🩸|blood|sangre|I faint when I see blood.
💉|needles|agujas|I'm afraid of needles.
🌑|the dark|la oscuridad|My son is afraid of the dark.
🛗|small spaces|espacios cerrados|I hate small spaces.
🤡|clowns|payasos|Many people are afraid of clowns.
🌊|deep water|aguas profundas|I'm scared of deep water.
🗣️|public speaking|hablar en público|He's terrified of public speaking.
😨|terrified of|aterrorizado de|I'm terrified of dogs.`},

{id:'v-bio',book:2,file:9,title:'Biographies',es:'Biografías: etapas de la vida',icon:'📜',photo:false,w:`
👶|be born|nacer|I was born in 1995.
🧒|grow up|crecer|I grew up in Santa Ana.
🏫|go to school|ir a la escuela|I went to school in San Salvador.
🎓|graduate|graduarse|She graduated in 2018.
💼|start work|empezar a trabajar|He started work at 18.
💘|fall in love|enamorarse|They fell in love in college.
💍|get married|casarse|They got married in 2020.
👨‍👩‍👧|have children|tener hijos|They had three children.
💔|get divorced|divorciarse|They got divorced last year.
🏡|move|mudarse|We moved to the US in 2010.
🧓|retire|jubilarse|My dad retired at 65.
🕊️|die|morir|He died in 1990.`},

{id:'v-invent',book:2,file:10,title:'Invent, discover…',es:'Verbos de creación',icon:'💡',photo:false,w:`
💡|invent|inventar|Edison invented the light bulb.
🔭|discover|descubrir|Fleming discovered penicillin.
📐|design|diseñar|He designed the building.
🏗️|build|construir|They built the bridge in 1990.
🖌️|paint|pintar|Picasso painted Guernica.
✍️|write|escribir|Cervantes wrote Don Quixote.
🎬|direct|dirigir|Spielberg directed Jurassic Park.
🎵|compose|componer|Beethoven composed nine symphonies.
🛠️|create|crear|Who created Facebook?
🏭|produce|producir|This factory produces cars.
📦|use|usar|Paper is used to make books.
🌱|grow|cultivar|Coffee is grown here.`},

{id:'v-subjects',book:2,file:10,title:'School subjects',es:'Materias escolares',icon:'🏫',photo:false,w:`
➗|math|matemáticas|I was bad at math.
📜|history|historia|History was my favorite subject.
🗺️|geography|geografía|We studied maps in geography.
🔬|science|ciencias|I love science.
🧪|chemistry|química|Chemistry was difficult.
⚛️|physics|física|Physics is interesting.
🧬|biology|biología|I want to study biology.
📚|literature|literatura|We read poems in literature.
🏃|P.E. (physical education)|educación física|P.E. was my favorite class.
🎨|art|arte|I loved art class.
🎼|music|música|We sang in music class.
💻|computer science|informática|I study computer science.
🗣️|foreign languages|idiomas extranjeros|Learning foreign languages is useful.`},

{id:'v-wordbuild',book:2,file:10,title:'Word building: nouns',es:'Formación de sustantivos',icon:'🧱',photo:false,w:`
🤔|decide → decision|decidir → decisión|It was a difficult decision.
📈|improve → improvement|mejorar → mejora|There's a big improvement.
😊|happy → happiness|feliz → felicidad|Money doesn't buy happiness.
🗣️|discuss → discussion|discutir → discusión|We had a long discussion.
🤝|agree → agreement|estar de acuerdo → acuerdo|We reached an agreement.
😢|sad → sadness|triste → tristeza|I felt a lot of sadness.
🧭|direct → direction|dirigir → dirección|Which direction?
💼|employ → employment|emplear → empleo|Employment is important.
🤗|kind → kindness|amable → amabilidad|Thanks for your kindness.
🗓️|invite → invitation|invitar → invitación|I got an invitation.
😴|ill → illness|enfermo → enfermedad|It's a serious illness.
🎉|celebrate → celebration|celebrar → celebración|What a celebration!`},

{id:'v-sports',book:2,file:11,title:'Sports',es:'Deportes',icon:'🏅',photo:true,w:`
⚽|soccer|fútbol|Soccer is very popular here.|Association football
🏀|basketball|baloncesto|I play basketball on Sundays.|Basketball
⚾|baseball|béisbol|Baseball is popular in the US.|Baseball
🏈|football (American)|fútbol americano|The Super Bowl is American football.|American football
🎾|tennis|tenis|Do you play tennis?|Tennis
🏐|volleyball|voleibol|We play volleyball at the beach.|Volleyball
🏊|swimming|natación|Swimming is great exercise.|Swimming (sport)
🚴|cycling|ciclismo|I go cycling on weekends.|Cycling
🥊|boxing|boxeo|He does boxing.|Boxing
🏄|surfing|surf|El Salvador is great for surfing.|Surfing
🧘|yoga|yoga|I do yoga to relax.|Yoga
🏃|running|correr|Running is cheap.|Running
⛳|golf|golf|My boss plays golf.|Golf
⛸️|skating|patinaje|Ice skating is difficult.|Ice skating
🥅|score a goal|anotar un gol|He scored two goals.|-
🏟️|team|equipo|Which is your favorite team?|-
🧑‍⚖️|referee|árbitro|The referee was terrible.|Referee
🏆|win a match|ganar un partido|We won the match 2-0.|-`},

{id:'v-phrasal',book:2,file:11,title:'Phrasal verbs',es:'Phrasal verbs comunes',icon:'🧩',photo:false,w:`
💡|turn on|encender|Turn on the light.
🌑|turn off|apagar|Turn off the TV.
🔊|turn up / turn down|subir / bajar (volumen)|Turn the music down!
🧥|put on|ponerse (ropa)|Put on your jacket.
👟|take off|quitarse (ropa)|Take off your shoes.
🗑️|throw away|botar|Don't throw it away!
🔙|give back|devolver|Give me back my phone.
🔎|look for|buscar|I'm looking for my glasses.
👶|look after|cuidar|She looks after her grandma.
📞|call back|devolver la llamada|I'll call you back.
🚗|pick up|recoger|Can you pick me up at 6?
🚭|give up|dejar (un hábito)|He gave up smoking.
🔍|find out|averiguar|I found out the truth.
📝|fill in / fill out|llenar (formulario)|Fill out this form.
🏃|go out|salir|Let's go out tonight.
⏰|wake up|despertarse|I woke up late.
🪑|sit down|sentarse|Please sit down.
🧍|stand up|ponerse de pie|Stand up, please.
✍️|write down|anotar|Write down the new words.
🔁|try on|probarse|Try on these shoes.`},

{id:'v-similar',book:2,file:11,title:'Similarities',es:'Expresar similitudes',icon:'👯',photo:false,w:`
👯|So do I.|Yo también (+).|I love pizza. – So do I.
🙅|Neither do I.|Yo tampoco (−).|I don't smoke. – Neither do I.
✋|So am I.|Yo también (be).|I'm tired. – So am I.
🤚|Neither am I.|Yo tampoco (be).|I'm not hungry. – Neither am I.
⏪|So did I.|Yo también (pasado).|I went to bed late. – So did I.
👌|So have I.|Yo también (PP).|I've been to Mexico. – So have I.
🫵|Me too.|Yo también (informal).|I'm hungry. – Me too.
👥|both|ambos|We both like salsa.
🪞|the same as|igual que|My phone is the same as yours.
🔗|similar to|parecido a|Your house is similar to mine.`},

{id:'v-verbphr12',book:2,file:12,title:'Verb phrases & say/tell',es:'Frases verbales; say / tell / ask',icon:'🗨️',photo:false,w:`
🗣️|tell a lie|decir una mentira|Don't tell lies.
✅|tell the truth|decir la verdad|Always tell the truth.
📢|tell a joke|contar un chiste|He tells great jokes.
📖|tell a story|contar una historia|Tell me a story.
👋|say hello / goodbye|saludar / despedirse|Say hello to your mom.
🙏|say sorry|pedir disculpas|Say sorry to your sister.
❓|ask a question|hacer una pregunta|Can I ask a question?
🆘|ask for help|pedir ayuda|Ask for help if you need it.
🙋|ask somebody out|invitar a salir|He asked her out.
🔒|keep a secret|guardar un secreto|Can you keep a secret?
🎂|forget a birthday|olvidar un cumpleaños|He forgot my birthday!
🚦|miss the bus|perder el bus|I missed the bus.`}
];
