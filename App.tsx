
import React, { useState, useEffect, useRef } from 'react';
import { generateNextStep } from './services/geminiService';
import { StorySegment, GameState } from './types';

const INITIAL_TEXT = "Merhaba, bu uygulama Hasan isimli bir öküzün hikayesini anlatır. Başlamak ister misin?";

const NO_PHASES = [
  "Cidden mi? Hasan bekliyor ama... [Görsel: Hasan şaşkın bir ifadeyle bakıyor]",
  "Bak, hikaye çok güzel başlıyordu. Son kararın mı? [Görsel: Hasan yalvaran gözlerle bakıyor]",
  "Hasan üzülüyor bak... Gözleri doldu bile. Başlayalım mı? [Görsel: Hasan'ın gözleri nemli]",
  "Tamam tamam, şaka yaptım. Başlıyoruz değil mi? [Görsel: Hasan hafifçe gülümsüyor]",
  "Başka seçeneğin kalmadı dostum! Artık sadece 'Evet' diyebilirsin. [Görsel: Hasan zafer kazanmış gibi bakıyor]"
];

const FINAL_NO_PHASES = [
  "Buraya kadar gelip bırakamazsın! [Görsel: Hasan boynuzlarıyla yolu kapatıyor]",
  "Merakına yenik düşeceksin, biliyorum. [Görsel: Hasan muzipçe gülümsüyor]",
  "Hadi ama, sadece bir 'Evet' uzağındasın. [Görsel: Hasan parmağıyla (toynağıyla) butonu gösteriyor]",
  "Peki, pes ediyorum... Şaka şaka, etmiyorum! [Görsel: Hasan kahkaha atıyor]",
  "Başka yolun yok, 'Evet' butonunun parıltısına kapıl... [Görsel: Hasan hipnotize etmeye çalışıyor]"
];

const INTRO_STORY_1 = "Bir varmış, bir yokmuş... Uçsuz bucaksız yeşil meraların ortasında, kendi halinde yaşayan Öküz Hasan varmış. Hasan öyle devasa, boynuzlarıyla dünyayı deviren bir tip değilmiş; sessiz, sakin ve işinde gücünde biriymiş. Ancak Hasan’ın sırtında kimsenin görmediği, günden güne ağırlaşan dertlerden örülü görünmez bir küfe varmış. [Görsel: Hasan sırtında hayali bir yükle uzaklara bakıyor]";

const INTRO_STORY_2 = "Geçim sıkıntısı, yarın kaygısı ve bitmek bilmeyen aksilikler Hasan’ın zihnini bir sis bulutu gibi sarmış. O kadar yorgunmuş ki, artık aynaya baktığında bile kendini tanıyamaz hale gelmiş. [Görsel: Hasan bir su birikintisinde yorgun yansımasına bakıyor]";

const INTRO_STORY_3 = "Hasan’ın hayatındaki en büyük güzellik, ona her zaman destek olmaya çalışan sevgilisiymiş. Sevgilisi, Hasan’ın omuzlarındaki yükü hafifletmek için ona yaklaşmak, onunla konuşmak istedikçe; Hasan daha da içine kapanmış. Stres, Hasan’ın içindeki nezaketi bir gölge gibi örtmüş. [Görsel: Hasan sevgilisinin şefkatli bakışlarından yüzünü çeviriyor]";

const INTRO_STORY_4 = "Bir akşam, yine dertlerin altında nefes alamazken, sevgilisinin \"Neyin var, anlat bana\" diyen şefkatli sesine karşı patlayıvermiş. Kötü biri olduğundan değil, sadece artık hiçbir şeye tahammülü kalmadığından... Sert sözler söylemiş, kalbini kırmış ve sonunda \"Ben bu yükle kimseyi mutlu edemem,\" diyerek çekip gitmiş. Kendi dertlerinin ağırlığı altında, sevdiği kişinin kalbinin ne kadar hassas olduğunu unutmuş. [Görsel: Hasan karanlığın içine doğru yürürken arkasında üzgün bir gölge bırakıyor]";

const INTRO_STORY_5 = "Hikaye bu kadar ama son bir kısım var okumak ister misin?";

const APOLOGY_TEXT = "Seni kırdığımda aslında kendi içimdeki fırtınayla savaşıyordum. Hayatın yükü altında ezilirken, senin sevgini bir sığınak görmek yerine, öfkemi yansıttığım bir ayna yaptım. Stresim gerçekti ama bu, senin kalbini paramparça etmem için bir bahane olmamalıydı. Ben yüklerimi paylaşmayı beceremedim, seni dertlerime kurban ettim. Tüm samimiyetimle ve değişmeye olan inancımla özür dilerim. Eski Hasan’dan daha fazlası vaat edemem ama hatalarıyla yüzleşmiş, dürüst bir Hasan olarak buradayım. Beni affedebilir misin? [Görsel: Hasan başı önünde, mahcup bir şekilde bekliyor]";

const FORGIVE_PERSUASION = "Hasan'ın çok üzüleceğini ve en azından bir şansı hak ettiğini biliyorum. Pişmanlığı gözlerinden okunuyor, lütfen bir kez daha düşün... [Görsel: Hasan'ın gözleri dolu dolu, umutla bakıyor]";

const FINAL_REVEAL = "Numaramı sildiğinin farkındayım o yüzden sana bu özürü basit bir uygulama ile vermem gerekti ancak gerçek özürümü duymak istersen +90 537 682 9209 numaram sadece . yazıp göndermen bile yeterli. Seni bekliyor olacağım... [Görsel: Hasan elinde (toynağında) bir telefonla heyecanla bekliyor]";

const extractVisualDescription = (text: string): string => {
  const match = text.match(/\[Görsel:\s*(.*?)\]/);
  return match ? match[1] : '';
};

const cleanStoryText = (text: string): string => {
  return text.replace(/\[Görsel:.*?\]/g, '').trim();
};

const OxCharacter: React.FC = () => (
  <svg viewBox="0 0 200 220" className="w-40 h-40 md:w-56 md:h-56 mx-auto drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
    {/* Bacaklar - Biraz daha içe doğru bükülmüş gibi */}
    <rect x="68" y="165" width="18" height="30" rx="8" fill="#5d4037" transform="rotate(5 68 165)" />
    <rect x="112" y="165" width="18" height="30" rx="8" fill="#5d4037" transform="rotate(-5 112 165)" />
    
    {/* Kuyruk - Aşağı sarkık */}
    <path d="M45 140 Q35 150 35 170" stroke="#5d4037" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="35" cy="170" r="4" fill="#5d4037" />
    
    {/* Gövde - Biraz daha yayvan ve ağır */}
    <ellipse cx="100" cy="145" rx="78" ry="52" fill="#8d6e63" />
    
    {/* Boyun Yelesi - Dağınık */}
    <path d="M70 110 L65 120 L75 125 L70 135 L80 140 L75 150" fill="none" stroke="#5d4037" strokeWidth="2" strokeLinecap="round" />
    <path d="M130 110 L135 120 L125 125 L130 135 L120 140 L125 150" fill="none" stroke="#5d4037" strokeWidth="2" strokeLinecap="round" />
    
    {/* Ayaklar/Tırnaklar */}
    <rect x="75" y="175" width="22" height="35" rx="10" fill="#8d6e63" stroke="#795548" strokeWidth="1" />
    <rect x="103" y="175" width="22" height="35" rx="10" fill="#8d6e63" stroke="#795548" strokeWidth="1" />
    <path d="M75 200 h22 v8 h-22 z" fill="#3e2723" />
    <path d="M103 200 h22 v8 h-22 z" fill="#3e2723" />
    
    {/* Kafa Grubu - Daha aşağıda ve hafif öne eğik (translate artırıldı) */}
    <g transform="translate(0, 28) rotate(2 100 95)">
      {/* Boynuzlar */}
      <path d="M70 65 Q55 35 35 50" stroke="#5d4037" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M130 65 Q145 35 165 50" stroke="#5d4037" strokeWidth="9" fill="none" strokeLinecap="round" />
      
      {/* Kafa */}
      <ellipse cx="100" cy="95" rx="55" ry="48" fill="#8d6e63" stroke="#795548" strokeWidth="2" />
      
      {/* Kulaklar - Aşağı sarkık */}
      <ellipse cx="45" cy="95" rx="18" ry="12" fill="#8d6e63" transform="rotate(10 45 95)" />
      <ellipse cx="155" cy="95" rx="18" ry="12" fill="#8d6e63" transform="rotate(-10 155 95)" />
      
      {/* Burun/Ağız Bölgesi */}
      <ellipse cx="100" cy="115" rx="42" ry="28" fill="#d7ccc8" />
      <circle cx="90" cy="112" r="4" fill="#5d4037" opacity="0.4" />
      <circle cx="110" cy="112" r="4" fill="#5d4037" opacity="0.4" />
      
      {/* Gözler - Biraz daha hüzünlü ve aşağıda */}
      <circle cx="78" cy="90" r="8" fill="#212121" />
      <circle cx="122" cy="90" r="8" fill="#212121" />
      <circle cx="76" cy="87" r="3" fill="white" opacity="0.6" />
      <circle cx="120" cy="87" r="3" fill="white" opacity="0.6" />
      
      {/* Kaşlar - Hüzünlü/Mahcup eğim (Q noktaları değiştirildi) */}
      <path d="M68 78 Q78 85 88 78" stroke="#3e2723" strokeWidth="2.5" fill="none" />
      <path d="M112 78 Q122 85 132 78" stroke="#3e2723" strokeWidth="2.5" fill="none" />

      {/* ŞAPKA - Hafif yana kaymış ve öne eğik */}
      <g transform="translate(95, 45) rotate(-5)">
        {/* Şapka Kenarı */}
        <ellipse cx="0" cy="5" rx="52" ry="14" fill="#d4a373" stroke="#a68a64" strokeWidth="1" />
        {/* Şapka Üstü */}
        <path d="M-25 5 L-22 -12 Q0 -18 22 -12 L25 5" fill="#e9c46a" stroke="#a68a64" strokeWidth="1" />
        {/* Şapka Bandı */}
        <path d="M-24 -1 L24 -1 L23 4 L-23 4 Z" fill="#780000" />
      </g>
    </g>
  </svg>
);

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    history: [],
    isStarted: false,
    isLoading: false,
    error: null,
  });
  
  const [currentText, setCurrentText] = useState<string>(INITIAL_TEXT);
  const [noPhaseIndex, setNoPhaseIndex] = useState<number>(-1);
  const [finalNoPhaseIndex, setFinalNoPhaseIndex] = useState<number>(-1);
  const [introStep, setIntroStep] = useState<number>(0); // 0: Start, 1-4: Story, 5: Question, 6: Apology, 7: Final
  const [aiStarted, setAiStarted] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentText, state.isLoading]);

  const handleChoice = async (choice: 'Evet' | 'Hayır' | 'Devam Et') => {
    if (state.isLoading) return;

    // Phase 0: Initial Start
    if (introStep === 0) {
      if (choice === 'Evet') {
        setCurrentText(INTRO_STORY_1);
        setIntroStep(1);
        setState(prev => ({ ...prev, isStarted: true }));
        return;
      } else if (choice === 'Hayır') {
        const nextIndex = noPhaseIndex + 1;
        if (nextIndex < NO_PHASES.length) {
          setNoPhaseIndex(nextIndex);
          setCurrentText(NO_PHASES[nextIndex]);
        }
        return;
      }
    }

    // Story Transitions
    if (introStep >= 1 && introStep <= 3 && choice === 'Devam Et') {
      const texts = [INTRO_STORY_1, INTRO_STORY_2, INTRO_STORY_3, INTRO_STORY_4];
      setCurrentText(texts[introStep]);
      setIntroStep(introStep + 1);
      return;
    }
    
    if (introStep === 4 && choice === 'Devam Et') {
      setCurrentText(INTRO_STORY_5);
      setIntroStep(5);
      return;
    }

    // Phase 5: "Okumak ister misin?"
    if (introStep === 5) {
      if (choice === 'Evet') {
        setCurrentText(APOLOGY_TEXT);
        setIntroStep(6);
        return;
      } else if (choice === 'Hayır') {
        const nextIndex = finalNoPhaseIndex + 1;
        if (nextIndex < FINAL_NO_PHASES.length) {
          setFinalNoPhaseIndex(nextIndex);
          setCurrentText(FINAL_NO_PHASES[nextIndex]);
        }
        return;
      }
    }

    // Phase 6: "Affedebilir misin?"
    if (introStep === 6) {
      if (choice === 'Evet') {
        setCurrentText(FINAL_REVEAL);
        setIntroStep(7);
        return;
      } else if (choice === 'Hayır') {
        setCurrentText(FORGIVE_PERSUASION);
        return;
      }
    }

    // AI Journey (If triggered)
    if (aiStarted) {
      const visual = extractVisualDescription(currentText);
      const cleaned = cleanStoryText(currentText);

      const updatedHistory: StorySegment[] = [
        ...state.history,
        { text: cleaned, visualDescription: visual, role: 'model' },
        { text: choice, visualDescription: '', role: 'user' }
      ];

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const nextText = await generateNextStep(updatedHistory, choice);
        setCurrentText(nextText);
        setState(prev => ({ ...prev, history: updatedHistory, isLoading: false }));
      } catch (err) {
        setState(prev => ({ ...prev, isLoading: false, error: "Hasan şu an düşüncelere daldı..." }));
      }
    }
  };

  const resetGame = () => {
    setState({
      history: [],
      isStarted: false,
      isLoading: false,
      error: null,
    });
    setCurrentText(INITIAL_TEXT);
    setNoPhaseIndex(-1);
    setFinalNoPhaseIndex(-1);
    setIntroStep(0);
    setAiStarted(false);
  };

  const storyMainText = cleanStoryText(currentText);

  // Control Logic
  const showDevamEt = introStep >= 1 && introStep <= 4;
  const isInitialNoForced = introStep === 0 && noPhaseIndex === NO_PHASES.length - 1;
  const isFinalNoForced = introStep === 5 && finalNoPhaseIndex === FINAL_NO_PHASES.length - 1;
  const isEnd = introStep === 7;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-[#fdfaf6]">
      <header className="w-full max-w-2xl text-center mb-6">
        <h1 className="text-5xl font-bold text-amber-900 drop-shadow-sm">Öküz Hasan</h1>
      </header>

      <main className="w-full max-w-2xl flex flex-col items-center">
        <div className="mb-2 transform transition-all duration-500 hover:scale-110">
          <OxCharacter />
        </div>

        <div className="w-full bg-white rounded-3xl shadow-lg border border-stone-100 relative mb-8 overflow-hidden">
          <div className="p-8 md:p-12">
            {state.isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce"></div>
                </div>
                <p className="text-stone-400 text-sm font-medium italic">Hasan bir sonraki adımı düşünüyor...</p>
              </div>
            ) : (
              <p className="serif text-2xl md:text-3xl leading-relaxed text-stone-800 text-center animate-fadeIn whitespace-pre-wrap">
                {storyMainText}
              </p>
            )}
            <div ref={scrollRef}></div>
          </div>
          {state.error && (
            <div className="px-6 py-3 bg-red-50 text-red-600 text-sm text-center border-t border-red-100">
              {state.error}
            </div>
          )}
        </div>

        <div className="w-full px-2">
          {showDevamEt ? (
            <button
              onClick={() => handleChoice('Devam Et')}
              disabled={state.isLoading}
              className="w-full py-6 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white rounded-2xl font-bold text-2xl transition-all shadow-lg active:scale-95 flex flex-col items-center justify-center"
            >
              <span>DEVAM ET</span>
              <span className="text-xs font-normal opacity-70 mt-1">Hikayeye Devam</span>
            </button>
          ) : isEnd ? (
            <button
              onClick={resetGame}
              className="w-full py-6 bg-stone-800 hover:bg-black text-white rounded-2xl font-bold text-2xl transition-all shadow-lg active:scale-95 flex flex-col items-center justify-center"
            >
              <span>BAŞA DÖN</span>
              <span className="text-xs font-normal opacity-70 mt-1">Hasan Seni Bekliyor</span>
            </button>
          ) : (
            <div className={`grid ${(isInitialNoForced || isFinalNoForced) ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
              <button
                onClick={() => handleChoice('Evet')}
                disabled={state.isLoading}
                className="group relative py-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-2xl font-bold text-2xl transition-all shadow-lg hover:shadow-emerald-200 active:scale-95 flex flex-col items-center justify-center"
              >
                <span>EVET</span>
                <span className="text-xs font-normal opacity-70 group-hover:opacity-100 transition-opacity mt-1">
                  {introStep === 6 ? "Affettim" : "Başla / Kabul Et"}
                </span>
              </button>
              
              {!isInitialNoForced && !isFinalNoForced && (
                <button
                  onClick={() => handleChoice('Hayır')}
                  disabled={state.isLoading}
                  className="group relative py-6 bg-rose-600 hover:bg-rose-700 disabled:bg-stone-300 text-white rounded-2xl font-bold text-2xl transition-all shadow-lg hover:shadow-rose-200 active:scale-95 flex flex-col items-center justify-center"
                >
                  <span>HAYIR</span>
                  <span className="text-xs font-normal opacity-70 group-hover:opacity-100 transition-opacity mt-1">
                    {introStep === 6 ? "Düşünmem Lazım" : "Vazgeç"}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="w-full max-w-2xl mt-12 flex flex-col items-center space-y-4 opacity-60">
        <p className="text-xs text-stone-400 text-center max-w-xs">
          Hasan'ın kalbi senin parmaklarının ucunda. 
        </p>
      </footer>
    </div>
  );
};

export default App;
