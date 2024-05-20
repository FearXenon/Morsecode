const morseCodeMap = {
    'A': '.-',
    'B': '-...',
    'C': '-.-.',
    'D': '-..',
    'E': '.',
    'F': '..-.',
    'G': '--.',
    'H': '....',
    'I': '..',
    'J': '.---',
    'K': '-.-',
    'L': '.-..',
    'M': '--',
    'N': '-.',
    'O': '---',
    'P': '.--.',
    'Q': '--.-',
    'R': '.-.',
    'S': '...',
    'T': '-',
    'U': '..-',
    'V': '...-',
    'W': '.--',
    'X': '-..-',
    'Y': '-.--',
    'Z': '--..',
    '0': '-----',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.'
};

const morsePhrases = [
    "SOS please help",
    "The weather is good",
    "What time is it",
    "Learning is a lot of fun",
    "The dog runs fast",
    "I have a book",
    "Please come home",
    "The food tastes delicious",
    "We are going to the park",
    "She likes to play piano",
    "The car is blue",
    "See you tomorrow",
    "The bird flies high",
    "I like to drink tea",
    "The cat is cute",
    "It is raining a lot today",
    "The child plays outside",
    "The house is big",
    "The tree is green",
    "I read every day",
    "Please turn on the light",
    "The water is cold",
    "We are going to Berlin",
    "The movie was exciting",
    "I like this cake",
    "She has a bicycle",
    "He is writing a letter",
    "The window is open",
    "The table is round",
    "The bus is coming soon",
    "I work in the office",
    "We are playing in the garden",
    "This is my friend",
    "She learns every day",
    "The train is on time",
    "I am eating an apple",
    "The sun is shining brightly",
    "The concert was great",
    "We are dancing all night",
    "She is painting a picture"
];

const ctx = new AudioContext();
let oscillator = null;

const dotFrequency = 800; // Frequency for dot sound
const dashFrequency = 800; // Frequency for dash sound
const timeUnit = 100; // Time unit in milliseconds
const dotDuration = timeUnit; // Duration of dot
const dashDuration = 3 * timeUnit; // Duration of dash

let mode = 'rnd';

let target = '';
let input = '';

let textpos = 0;
let alphabetpos = 0;

let starttime = 0;
let keypressed = false;

let pause = false;

$(document).ready(function(){

    init();

    $(window).on('blur', function(e){
        if(oscillator){
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;
        }
    })

    $(document).on('change', '#modeselector', function(e){
        mode = $(e.currentTarget).val();
        alphabetpos = 0;
        clearMorse();
    })

    $(document).on('keydown', function(e){
        if(!keypressed && !pause){
            starttime = e.timeStamp;
            keypressed = true;
            playSound(dotFrequency);
        }
    })
    
    $(document).on('keyup', function(e){

        if(oscillator){
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;
        }

        if(!pause){
            endtime = e.timeStamp;
            let duration = endtime - starttime;
            starttime = 0;
            keypressed = false;


            if(duration < 150){
                $('#morse').append('<div class="dit"></div>');
                input += '.';
            }
            else{
                $('#morse').append('<div class="dah"></div>');
                input += '-';
            }

            tmp = target;
            if(mode == 'text'){
                tmp = target.charAt(textpos).toUpperCase();
                console.log(tmp)
            }

            if(hasMistake(input, morseCodeMap[tmp])){
                $('#morse').find(':not(.info):last').addClass('error');
                setTimeout(function(){
                    $('#morse').removeClass('correct');
                    $('#morse').children().remove(':not(.info)');
                    input = '';
                }, 500);
            }

            if(input == morseCodeMap[tmp]){
                pause = true;
                $('#morse').addClass('correct');
                setTimeout(function(){
                    clearMorse();
                }, 100);
            }

            if($('#morse').children(':not(.info)').length > 5 || e.keyCode == 27){
                pause = true;
                clearMorse()
            }
        }
    })
})

function init(){
    clearMorse();
    $('#modeselector').find('[value='+mode+']').prop('selected', true);
}

function clearMorse(){
    $('#morse').removeClass('correct');
    $('#morse').children().remove(':not(.info)');
    input = '';
    textpos++;
    alphabetpos = (alphabetpos % 35);
    switch(mode){
        case 'rnd':
            target = Object.keys(morseCodeMap)[Math.floor(Math.random() * Object.keys(morseCodeMap).length)];
            break;
        case 'alphabet':
            target = Object.keys(morseCodeMap)[alphabetpos++];
            break;
        case 'text':
            if(textpos >= target.length){
                target = morsePhrases[Math.floor(Math.random() * morsePhrases.length)]; 
                textpos = 0;
            }
            else{
                if(target.charAt(textpos) == ' '){
                    while(true){
                        textpos++;
                        if(textpos >= target.length || target.charAt(textpos) != ' '){
                            break;
                        }
                    }
                }
            }
            break;
    }

    $('#target').html(target);

    if(mode == 'text'){
        let text = $('#target').text();
        const highlightedText = text.substring(0, textpos) + 
            '<span class="highlight">' + text.charAt(textpos) + '</span>' + 
            text.substring(textpos + 1);
        $('#target').html(highlightedText);
    }

    pause = false;
}

function hasMistake(input, answer){
    if(input.length > answer.length){
        return true;
    }
    for(let i = 0; i < input.length; i++){
        if(input.charAt(i) != answer.charAt(i)){
            return true;
        }
    }

    return false;
}

function playSound(frequency) {
    oscillator = ctx.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.connect(ctx.destination);
    oscillator.start();
}