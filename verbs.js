/* ===== VERBOS ===== base|pasado|participio|español|nivel(1=AEF1,2=AEF2)|emoji */
const IRREG = `
be|was / were|been|ser / estar|1|🧍
become|became|become|convertirse en|2|🦋
begin|began|begun|empezar|1|🏁
bite|bit|bitten|morder|2|🦷
break|broke|broken|romper|1|💔
bring|brought|brought|traer|1|🎁
build|built|built|construir|1|🏗️
buy|bought|bought|comprar|1|🛒
catch|caught|caught|atrapar|2|🎣
choose|chose|chosen|elegir|2|☝️
come|came|come|venir|1|👋
cost|cost|cost|costar|1|💲
cut|cut|cut|cortar|1|✂️
do|did|done|hacer|1|✅
draw|drew|drawn|dibujar|2|✏️
dream|dreamed / dreamt|dreamed / dreamt|soñar|2|💭
drink|drank|drunk|beber|1|🥤
drive|drove|driven|manejar|1|🚗
eat|ate|eaten|comer|1|🍽️
fall|fell|fallen|caer|1|🍂
feel|felt|felt|sentir|1|❤️
fight|fought|fought|pelear|2|🥊
find|found|found|encontrar|1|🔍
fly|flew|flown|volar|1|✈️
forget|forgot|forgotten|olvidar|1|🤦
forgive|forgave|forgiven|perdonar|2|🤗
freeze|froze|frozen|congelar|2|🧊
get|got|gotten|obtener / llegar|1|📥
give|gave|given|dar|1|🎁
go|went|gone / been|ir|1|🚶
grow|grew|grown|crecer / cultivar|2|🌱
hang|hung|hung|colgar|2|🖼️
have|had|had|tener|1|🤲
hear|heard|heard|oír|1|👂
hide|hid|hidden|esconder|2|🙈
hit|hit|hit|golpear|2|👊
hold|held|held|sostener|2|✊
hurt|hurt|hurt|lastimar / doler|2|🤕
keep|kept|kept|guardar / mantener|2|🔒
know|knew|known|saber / conocer|1|🧠
lead|led|led|dirigir / guiar|2|🧭
learn|learned / learnt|learned / learnt|aprender|1|📚
leave|left|left|salir / dejar|1|🚪
lend|lent|lent|prestar|2|🤲
let|let|let|permitir|2|🆗
lie|lay|lain|acostarse|2|🛌
lose|lost|lost|perder|1|😢
make|made|made|hacer / fabricar|1|🛠️
mean|meant|meant|significar|2|❓
meet|met|met|conocer / reunirse|1|🤝
pay|paid|paid|pagar|1|💳
put|put|put|poner|1|📥
read|read|read|leer|1|📖
ride|rode|ridden|montar (bici, caballo)|1|🚲
ring|rang|rung|sonar (teléfono)|1|🔔
run|ran|run|correr|1|🏃
say|said|said|decir|1|💬
see|saw|seen|ver|1|👀
sell|sold|sold|vender|1|🏷️
send|sent|sent|enviar|1|📤
set|set|set|fijar / poner|2|⏰
shine|shone|shone|brillar|2|✨
shoot|shot|shot|disparar|2|🎯
show|showed|shown|mostrar|2|🖥️
shut|shut|shut|cerrar|2|🚪
sing|sang|sung|cantar|1|🎤
sink|sank|sunk|hundirse|2|🚢
sit|sat|sat|sentarse|1|🪑
sleep|slept|slept|dormir|1|😴
speak|spoke|spoken|hablar|1|🗣️
spend|spent|spent|gastar / pasar (tiempo)|1|💸
stand|stood|stood|estar de pie|1|🧍
steal|stole|stolen|robar|2|🦹
swim|swam|swum|nadar|1|🏊
take|took|taken|tomar / llevar|1|🫴
teach|taught|taught|enseñar|1|👩‍🏫
tear|tore|torn|rasgar|2|📄
tell|told|told|decir / contar|1|🗨️
think|thought|thought|pensar|1|🤔
throw|threw|thrown|lanzar|2|🤾
understand|understood|understood|entender|1|💡
wake|woke|woken|despertar|1|⏰
wear|wore|worn|llevar puesto|1|👗
win|won|won|ganar|1|🏆
write|wrote|written|escribir|1|✍️`;

/* base|pasado|sonido -ed (t, d, id)|español */
const REG = `
work|worked|t|trabajar
watch|watched|t|mirar
walk|walked|t|caminar
cook|cooked|t|cocinar
stop|stopped|t|parar
like|liked|t|gustar
finish|finished|t|terminar
look|looked|t|mirar
help|helped|t|ayudar
dance|danced|t|bailar
kiss|kissed|t|besar
laugh|laughed|t|reírse
play|played|d|jugar
live|lived|d|vivir
listen|listened|d|escuchar
call|called|d|llamar
study|studied|d|estudiar
travel|traveled|d|viajar
arrive|arrived|d|llegar
try|tried|d|intentar
stay|stayed|d|quedarse
open|opened|d|abrir
love|loved|d|amar
change|changed|d|cambiar
want|wanted|id|querer
need|needed|id|necesitar
decide|decided|id|decidir
start|started|id|empezar
visit|visited|id|visitar
wait|waited|id|esperar
hate|hated|id|odiar
rent|rented|id|rentar
invent|invented|id|inventar
end|ended|id|terminar`;
