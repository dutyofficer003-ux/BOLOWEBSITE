// Universal Dynamic Translation Engine
// Automatically handles ANY browser language with localStorage caching

(function() {
    'use strict';

    // Step 1: Inject blocking style immediately to prevent English text flash
    const blockingStyle = document.createElement('style');
    blockingStyle.textContent = 'html { display: none !important; }';
    blockingStyle.id = 'translation-blocker';
    document.documentElement.appendChild(blockingStyle);

    // localStorage key for translation cache
    const TRANSLATION_CACHE_KEY = 'translation_cache_v1';
    const LANGUAGE_KEY = 'detected_language';

    // Static translation dictionary for key-based translations
    const staticTranslations = {
        'welcome_title': {
            'en': 'WELCOME TO THE NEW WORLD ORDER,',
            'es': 'BIENVENIDO AL NUEVO ORDEN MUNDIAL,',
            'tr': 'YENİ DÜNYA DÜZENİNE HOŞ GELDİNİZ,',
            'nl': 'WELKOM IN DE NIEUWE WERELDORDE,',
            'it': 'BENVENUTO NEL NUOVO ORDINE MONDIALE,',
            'pt': 'BEM-VINDO À NOVA ORDEM MUNDIAL,',
            'ru': 'ДОБРО ПОЖАЛОВАТЬ В НОВЫЙ МИРОВОЙ ПОРЯДОК,',
            'ar': 'مرحبًا بكم في النظام العالمي الجديد،',
            'ro': 'BUN VENIT ÎN NOUA ORDINE MONDIALĂ,',
            'sr': 'ДОБРОДОШЛИ У НОВИ СВЕТСКИ ПОРЕДАК,',
            'cs': 'VÍTEJTE V NOVÉM SVĚTOVÉM ŘÁDU,',
            'hr': 'DOBRODOŠLI U NOVI SVJETSKI POREDAK,',
            'ja': '新世界秩序へようこそ、',
            'zh': '欢迎来到新世界秩序，',
            'id': 'SELAMAT DATANG DI TATA DUNIA BARU,',
            'tl': 'MALIGAYANG DATANG SA BAGONG UTOS NG MUNDO,',
            'hi': 'नई विश्व व्यवस्था में आपका स्वागत है,'
        },
        'citizen_of': {
            'en': 'CITIZEN OF',
            'es': 'CIUDADANO DE',
            'tr': 'VATANDAŞI',
            'nl': 'INWONER VAN',
            'it': 'CITTADINO DEL',
            'pt': 'CIDADÃO DE',
            'ru': 'ГРАЖДАНИН',
            'ar': 'مواطن من',
            'ro': 'CETĂȚEAN AL',
            'sr': 'ДРЖАВЉАНИН',
            'cs': 'OBČAN',
            'hr': 'GRAĐANIN',
            'ja': '市民：',
            'zh': '公民：',
            'id': 'WARGA NEGARA',
            'tl': 'MAMAMAYAN NG',
            'hi': 'नागरिक:'
        },
        'app_under_review': {
            'en': 'APPLICATION UNDER REVIEW',
            'es': 'SOLICITUD EN REVISIÓN',
            'tr': 'BAŞVURU İNCELENİYOR',
            'nl': 'AANVRAAG IN BEHANDELING',
            'it': 'DOMANDA IN REVISIONE',
            'pt': 'CANDIDATURA EM REVISÃO',
            'ru': 'ЗАЯВКА НА РАССМОТРЕНИИ',
            'ar': 'الطلب قيد المراجعة',
            'ro': 'CERERE ÎN REVIZIE',
            'sr': 'ZAHTEV U OBRADI',
            'cs': 'ŽÁDOST V POSOUZENÍ',
            'hr': 'ZAHTJEV U OBRADI',
            'ja': '申請審査中',
            'zh': '申请审查中',
            'id': 'PERMOHONAN DALAM TINJAUAN',
            'tl': 'ANG APLIKASYON AY NASA PAGSUSURI',
            'hi': 'आवेदन समीक्षा में'
        },
        'review_description': {
            'en': 'Your membership application is currently being reviewed by the Security Council. This page is locked until approval is granted.',
            'es': 'Su solicitud de membresía está siendo revisada actualmente por el Consejo de Seguridad. Esta página está bloqueada hasta que se otorgue la aprobación.',
            'tr': 'Üyelik başvurunuz şu anda Güvenlik Konseyi tarafından inceleniyor. Onay verilene kadar bu sayfa kilitli kalacaktır.',
            'nl': 'Uw lidmaatschapsaanvraag wordt momenteel beoordeeld door de Veiligheidsraad. Deze pagina blijft vergrendeld tot goedkeuring wordt verleend.',
            'it': 'La tua richiesta di adesione è attualmente in fase di revisione da parte del Consiglio di Sicurezza. Questa pagina rimarrà bloccata fino all\'approvazione.',
            'pt': 'A sua candidatura de filiação está atualmente a ser revista pelo Conselho de Segurança. Esta página permanecerá bloqueada até que a aprovação seja concedida.',
            'ru': 'Ваша заявка на членство в настоящее время рассматривается Советом Безопасности. Эта страница заблокирована до утверждения.',
            'ar': 'جاري حالياً مراجعة طلب عضويتك من قبل مجلس الأمن. تظل هذه الصفحة مقفلة حتى يتم منح الموافقة.',
            'ro': 'Cererea dumneavoastră de membru este în prezent revizuită de Consiliul de Securitate. Această pagină rămâne blocată până la aprobare.',
            'sr': 'Vaša prijava za članstvo se trenutno razmatra od strane Saveta bezbednosti. Ova stranica ostaje zaključana do odobrenja.',
            'cs': 'Vaše žádost o členství je v současné době přezkoumávána Bezpečnostní radou. Tato stránka zůstane uzamčena do schválení.',
            'hr': 'Vaša prijava za članstvo se trenutno razmatra od strane Vijeća sigurnosti. Ova stranica ostaje zaključena do odobrenja.',
            'ja': '会員申請は現在、安全保障理事会によって審査されています。承認が得られるまで、このページはロックされています。',
            'zh': '您的会员申请目前正由安全理事会审查。在获得批准之前，此页面将保持锁定状态。',
            'id': 'Aplikasi keanggotaan Anda sedang ditinjau oleh Dewan Keamanan. Halaman ini terkunci sampai persetujuan diberikan.',
            'tl': 'Ang iyong aplikasyon para sa kasapi ay kasalukuyang sinusuri ng Security Council. Ang pahinang ito ay nakakandado hanggang sa magbigay ng pag-apruba.',
            'hi': 'आपकी सदस्यता आवेदन वर्तमान में सुरक्षा परिषद द्वारा समीक्षा की जा रही है। अनुमोदन मिलने तक यह पृष्ठ लॉक रहेगा।'
        },
        'status_pending': {
            'en': 'Status: PENDING APPROVAL',
            'es': 'Estado: APROBACIÓN PENDIENTE',
            'tr': 'Durum: ONAY BEKLENİYOR',
            'nl': 'Status: IN BEHANDELING',
            'it': 'Stato: IN ATTESA DI APPROVAZIONE',
            'pt': 'Estado: APROVAÇÃO PENDENTE',
            'ru': 'Статус: НА РАССМОТРЕНИИ',
            'ar': 'الحالة: قيد الانتظار',
            'ro': 'Stare: ÎN AȘTEPTARE',
            'sr': 'Status: NA ČEKANJU',
            'cs': 'Stav: ČEKÁ NA SCHVÁLENÍ',
            'hr': 'Status: ČEKA NA ODGOVOR',
            'ja': 'ステータス：承認待ち',
            'zh': '状态：待批准',
            'id': 'Status: MENUNGGU PERSETUJUAN',
            'tl': 'Status: NAGHIHINTAY NG APRUBA',
            'hi': 'स्थिति: अनुमोदन प्रलंबित'
        },
        'protocol_active': {
            'en': 'Protocol Active: Real-time monitoring enabled',
            'es': 'Protocolo Activo: Monitoreo en tiempo real habilitado',
            'tr': 'Protokol Aktif: Gerçek zamanlı izleme etkin',
            'nl': 'Protocol Actief: Real-time monitoring ingeschakeld',
            'it': 'Protocollo Attivo: Monitoraggio in tempo reale abilitato',
            'pt': 'Protocolo Ativo: Monitoramento em tempo real ativado',
            'ru': 'Протокол активен: Мониторинг в реальном времени включен',
            'ar': 'البروتوكول نشط: المراقبة في الوقت الفعلي مفعلة',
            'ro': 'Protocol Activ: Monitorizare în timp real activată',
            'sr': 'Protokol Aktivan: Praćenje u realnom vremenu omogućeno',
            'cs': 'Protokol aktivní: Monitorování v reálném čase povoleno',
            'hr': 'Protokol aktivan: Praćenje u stvarnom vremenu omogućeno',
            'ja': 'プロトコルアクティブ：リアルタイム監視が有効',
            'zh': '协议激活：实时监控已启用',
            'id': 'Protokol Aktif: Pemantauan waktu nyata diaktifkan',
            'tl': 'Protokol Aktibo: Real-time monitoring na naka-enable',
            'hi': 'प्रोटोकॉल सक्रिय: रियल-टाइम मॉनिटरिंग सक्षम'
        },
        'secure_channel_title': {
            'en': 'SECURE CHANNEL ESTABLISHED',
            'es': 'CANAL SEGURO ESTABLECIDO',
            'tr': 'GÜVENLİ KANAL KURULDU',
            'nl': 'VEILIG KANAAL OPGEZET',
            'it': 'CANALE SICURO STABILITO',
            'pt': 'CANAL SEGURO ESTABELECIDO',
            'ru': 'БЕЗОПАСНЫЙ КАНАЛ УСТАНОВЛЕН',
            'ar': 'تم إنشاء قناة آمنة',
            'ro': 'CANAL SECURIZAT STABILIT',
            'sr': 'BEZBEDAN KANAL USPOSTAVLJEN',
            'cs': 'BEZPEČNÝ KANÁL ZALOŽEN',
            'hr': 'SIGURNOSNI KANAL USPOSTAVLJEN',
            'ja': '安全なチャネルが確立されました',
            'zh': '安全通道已建立',
            'id': 'SALURAN AMAN DITETAPKAN',
            'tl': 'ANG SEGURONG CHANNEL AY NAITATAG',
            'hi': 'सुरक्षित चैनल स्थापित'
        },
        'payout_protocol_msg': {
            'en': 'Your payout channel has been successfully linked to the Global Ledger. However, internal protocol 7-B requires a 180-day maturation period before the first $500,000 disbursement can be authorized.',
            'es': 'Su canal de pago se ha vinculado exitosamente al Global Ledger. Sin embargo, el protocolo interno 7-B requiere un período de maduración de 180 días antes de que se pueda autorizar el primer desembolso de $500,000.',
            'tr': 'Ödeme kanalınız Global Ledger\'e başarıyla bağlandı. Ancak, iç protokol 7-B, ilk $500,000 ödemenin yetkilendirilmesinden önce 180 günlük bir olgunlaşma süresi gerektirir.',
            'nl': 'Uw uitbetalingskanaal is succesvol gekoppeld aan de Global Ledger. Echter vereist intern protocol 7-B een rijpingsperiode van 180 dagen voordat de eerste $500.000 uitbetaling kan worden geautoriseerd.',
            'it': 'Il tuo canale di pagamento è stato collegato con successo al Global Ledger. Tuttavia, il protocollo interno 7-B richiede un periodo di maturazione di 180 giorni prima che possa essere autorizzata la prima erogazione di $500.000.',
            'pt': 'O seu canal de pagamento foi vinculado com sucesso ao Global Ledger. No entanto, o protocolo interno 7-B exige um período de maturação de 180 dias antes que o primeiro desembolso de $500.000 possa ser autorizado.',
            'ru': 'Ваш канал выплат успешно связан с Global Ledger. Однако внутренний протокол 7-B требует 180-дневного периода созревания до того, как может быть авторизована первая выплата в размере $500,000.',
            'ar': 'تم ربط قناة الدفع الخاصة بك بنجاح بالدفتر العام العالمي. ومع ذلك، يتطلب البروتوكول الداخلي 7-B فترة نضج مدتها 180 يومًا قبل أن يمكن التفويض بالدفع الأول البالغ 500,000 دولار.',
            'ro': 'Canalul dvs. de plată a fost conectat cu succes la Global Ledger. Cu toate acestea, protocolul intern 7-B necesită o perioadă de maturare de 180 de zile înainte ca prima plată de 500.000 USD să poată fi autorizată.',
            'sr': 'Vaš kanal za isplatu je uspešno povezan sa Global Ledger-om. Međutim, interni protokol 7-B zahteva period sazrevanja od 180 dana pre nego što se može odobriti prva isplata od 500.000 USD.',
            'cs': 'Váš výplatní kanál byl úspěšně propojen s Global Ledger. Interní protokol 7-B však vyžaduje 180denní dobu zrání předtím, než může být autorizována první výplata ve výši 500 000 USD.',
            'hr': 'Vaš kanal za isplatu je uspješno povezan s Global Ledger-om. Međutim, interni protokol 7-B zahtijeva razdoblje sazrijevanja od 180 dana prije nego što se može odobriti prva isplata od 500.000 USD.',
            'ja': '支払いチャネルはGlobal Ledgerに正常にリンクされました。ただし、内部プロトコル7-Bにより、最初の$500,000支払いが承認される前に180日間の熟成期間が必要です。',
            'zh': '您的支付渠道已成功链接到全球账本。但是，内部协议7-B要求180天的成熟期，然后才能授权首次$500,000的支付。',
            'id': 'Saluran pembayaran Anda telah berhasil ditautkan ke Global Ledger. Namun, protokol internal 7-B memerlukan periode pematangan 180 hari sebelum pembayaran pertama $500.000 dapat diotorisasi.',
            'tl': 'Ang iyong channel ng payout ay matagumpay na nalink sa Global Ledger. Gayunpaman, ang internal protocol 7-B ay nangangailangan ng 180-araw na maturation period bago ma-authorize ang unang $500,000 disbursement.',
            'hi': 'आपका भुगतान चैनल ग्लोबल लेजर से सफलतापूर्वक जुड़ गया है। हालांकि, आंतरिक प्रोटोकॉल 7-B के लिए पहले $500,000 भुगतान को अधिकृत किए जाने से पहले 180 दिन की परिपक्वता अवधि आवश्यक है।'
        },
        'maturation_progress_label': {
            'en': 'Maturation Progress',
            'es': 'Progreso de maduración',
            'tr': 'Olgunlaşma İlerlemesi',
            'nl': 'Rijpingsvoortgang',
            'it': 'Progresso di maturazione',
            'pt': 'Progresso de maturação',
            'ru': 'Прогресс созревания',
            'ar': 'تقدم النضج',
            'ro': 'Progres de maturare',
            'sr': 'Napredak sazrevanja',
            'cs': 'Průběh zrání',
            'hr': 'Napredak sazrijevanja',
            'ja': '熟成進捗',
            'zh': '成熟进度',
            'id': 'Kemajuan Pematangan',
            'tl': 'Maturation Progress',
            'hi': 'परिपक्वता प्रगति'
        },
        'days_remaining_text': {
            'en': 'days remaining',
            'es': 'días restantes',
            'tr': 'gün kaldı',
            'nl': 'dagen resterend',
            'it': 'giorni rimanenti',
            'pt': 'dias restantes',
            'ru': 'дней осталось',
            'ar': 'أيام متبقية',
            'ro': 'zile rămase',
            'sr': 'dana preostalo',
            'cs': 'dní zbývá',
            'hr': 'dana preostalo',
            'ja': '残り日数',
            'zh': '剩余天数',
            'id': 'hari tersisa',
            'tl': 'mga araw na natitira',
            'hi': 'शेष दिन'
        },
        'view_progress_btn': {
            'en': 'VIEW MATURATION PROGRESS',
            'es': 'VER PROGRESO DE MADURACIÓN',
            'tr': 'OLGUNLAŞMA İLERLEMESİNİ GÖRÜNTÜLE',
            'nl': 'RIJPINGSVOORTGANG BEKIJKEN',
            'it': 'VISUALIZZA PROGRESSO MATURAZIONE',
            'pt': 'VER PROGRESSO DA MATURAÇÃO',
            'ru': 'ПОСМОТРЕТЬ ПРОГРЕСС СОЗРЕВАНИЯ',
            'ar': 'عرض تقدم النضج',
            'ro': 'VEDEȚI PROGRESUL DE MATURARE',
            'sr': 'PRIKAŽI NAPREDAK SAZREVAANJA',
            'cs': 'ZOBRAZIT PRŮBĚH ZRÁNÍ',
            'hr': 'PRIKAŽI NAPREDAK SAZRIJEVANJA',
            'ja': '熟成進捗を表示',
            'zh': '查看成熟进度',
            'id': 'LIHAT KEMAJUAN PEMATANGAN',
            'tl': 'TIGNAN ANG MATURATION PROGRESS',
            'hi': 'परिपक्वता प्रगति देखें'
        }
    };

    // ==========================================
    // 1. DICTIONARIES
    // ==========================================
    window.translations = window.translations || {};

    window.translations.en = {
        ...window.translations.en,
        "welcome_title": "WELCOME TO THE NEW WORLD ORDER,",
        "citizen_of": "CITIZEN OF",
        "app_under_review": "APPLICATION UNDER REVIEW",
        "review_description": "Your membership application is currently being reviewed by the Security Council. This page is locked until approval is granted.",
        "status_pending": "Status: PENDING APPROVAL",
        "protocol_active": "Protocol Active: Real-time monitoring enabled",
        "withdrawal_request_title": "Withdrawal Request",
        "secure_channel_title": "SECURE CHANNEL ESTABLISHED",
        "payout_protocol_msg": "Your payout channel has been successfully linked to the Global Ledger. However, internal protocol 7-B requires a 180-day maturation period before the first $500,000 disbursement can be authorized.",
        "maturation_progress_label": "Maturation Progress",
        "days_remaining_text": "days remaining",
        "view_progress_btn": "VIEW MATURATION PROGRESS",
        "congratulations_title": "CONGRATULATIONS",
        "welcome_prefix": "Welcome",
        "membership_approved_part1": "Your membership has been",
        "approved_text": "APPROVED",
        "membership_approved_part2": "by the Security Council.",
        "you_are_now_label": "You Are Now",
        "illuminati_rank_label": "AN ILLUMINATI",
        "elite_status_active": " ELITE STATUS: ACTIVE",
        "enter_dashboard_btn": "ENTER ELITE DASHBOARD",
        "app_under_review_title": "APPLICATION UNDER REVIEW",
        "app_review_subtitle": "The Security Council is currently reviewing your credentials.",
        "app_review_msg_1": "Your membership application has been successfully submitted to Illuminati New World Order.",
        "app_review_msg_2": "The Security Council is currently reviewing your credentials and background information.",
        "app_review_msg_3": "This process typically takes 24-72 hours. You will receive notification once your Elite Account access has been approved.",
        "return_to_portal": "Return to Portal",
        "app_review_desc_1": "Your membership application is currently being reviewed by the Security Council.",
        "app_review_desc_2": "This page is locked until approval is granted.",
        "app_review_desc_3": "BY SECRETARY GENERAL",
        "app_review_desc_4": "Your membership application is currently under review by the Secretary General.",
        "app_review_desc_5": "This process typically takes 24-72 hours. You will receive notification once your Elite Account access has been approved.",
        "status_label": "Status:",
        "status_pending_approval": "PENDING APPROVAL",
        "protocol_active_footer": "🔐 Protocol Active: Real-time monitoring enabled"
    };

    window.translations.pt = {
        ...window.translations.pt,
        "welcome_title": "BEM-VINDO À NOVA ORDEM MUNDIAL,",
        "citizen_of": "CIDADÃO DE",
        "app_under_review": "CANDIDATURA EM REVISÃO",
        "review_description": "A sua candidatura de filiação está atualmente a ser revista pelo Conselho de Segurança. Esta página permanecerá bloqueada até que a aprovação seja concedida.",
        "status_pending": "Estado: APROVAÇÃO PENDENTE",
        "protocol_active": "Protocolo Ativo: Monitoramento em tempo real ativado",
        "withdrawal_request_title": "Solicitação de retirada",
        "secure_channel_title": "CANAL SEGURO ESTABELECIDO",
        "payout_protocol_msg": "Seu canal de pagamento foi vinculado com sucesso ao Global Ledger. No entanto, o protocolo interno 7-B exige um período de maturação de 180 dias antes que o primeiro desembolso de $500.000 possa ser autorizado.",
        "maturation_progress_label": "Progresso de maturação",
        "days_remaining_text": "dias restantes",
        "view_progress_btn": "VER O PROGRESSO DA MATURAÇÃO",
        "congratulations_title": "PARABÉNS",
        "welcome_prefix": "Bem-vindo",
        "membership_approved_part1": "Sua adesão foi",
        "approved_text": "APROVADA",
        "membership_approved_part2": "pelo Conselho de Segurança.",
        "you_are_now_label": "Você Agora é",
        "illuminati_rank_label": "UM ILLUMINATI",
        "elite_status_active": "🏛️ STATUS ÉLITE: ATIVO",
        "enter_dashboard_btn": "🏛️ ENTRAR NO PAINEL ÉLITE",
        "app_under_review_title": "SOLICITAÇÃO EM ANÁLISE",
        "app_review_subtitle": "O Conselho de Segurança está analisando suas credenciais.",
        "app_review_msg_1": "Sua solicitação de adesão foi enviada com sucesso para a Nova Ordem Mundial Illuminati.",
        "app_review_msg_2": "O Conselho de Segurança está analisando suas credenciais e informações de fundo.",
        "app_review_msg_3": "Este processo geralmente leva 24-72 horas. Você receberá notificação assim que seu acesso à Conta Élite for aprovado.",
        "return_to_portal": "Voltar ao Portal",
        "app_review_desc_1": "Sua solicitação de adesão está sendo analisada pelo Conselho de Segurança.",
        "app_review_desc_2": "Esta página está bloqueada até que a aprovação seja concedida.",
        "app_review_desc_3": "PELO SECRETÁRIO GERAL",
        "app_review_desc_4": "Sua solicitação de adesão está sob análise do Secretário Geral.",
        "app_review_desc_5": "Este processo geralmente leva 24-72 horas. Você receberá notificação assim que seu acesso à Conta Élite for aprovado.",
        "status_label": "Status:",
        "status_pending_approval": "PENDENTE DE APROVAÇÃO",
        "protocol_active_footer": "🔐 Protocolo Ativo: Monitoramento em tempo real ativado"
    };

    window.translations.es = {
        ...window.translations.es,
        "welcome_title": "BIENVENIDO AL NUEVO ORDEN MUNDIAL,",
        "citizen_of": "CIUDADANO DE",
        "app_under_review": "SOLICITUD EN REVISIÓN",
        "review_description": "Su solicitud de membresía está siendo revisada actualmente por el Consejo de Seguridad. Esta página está bloqueada hasta que se otorgue la aprobación.",
        "status_pending": "Estado: APROBACIÓN PENDIENTE",
        "protocol_active": "Protocolo Activo: Monitoreo en tiempo real habilitado",
        "withdrawal_request_title": "Solicitud de retiro",
        "secure_channel_title": "CANAL SEGURO ESTABLECIDO",
        "payout_protocol_msg": "Su canal de pago se ha vinculado exitosamente al Global Ledger. Sin embargo, el protocolo interno 7-B requiere un período de maduración de 180 días antes de que se pueda autorizar el primer desembolso de $500,000.",
        "maturation_progress_label": "Progreso de maduración",
        "days_remaining_text": "días restantes",
        "view_progress_btn": "VER PROGRESO DE MADURACIÓN",
        "congratulations_title": "FELICIDADES",
        "welcome_prefix": "Bienvenido",
        "membership_approved_part1": "Su membresía ha sido",
        "approved_text": "APROBADA",
        "membership_approved_part2": "por el Consejo de Seguridad.",
        "you_are_now_label": "Ahora eres",
        "illuminati_rank_label": "UN ILLUMINATI",
        "elite_status_active": "🏛️ ESTADO ÉLITE: ACTIVO",
        "enter_dashboard_btn": "🏛️ ENTRAR AL PANEL ÉLITE",
        "app_under_review_title": "SOLICITUD EN REVISIÓN",
        "app_review_subtitle": "El Consejo de Seguridad está revisando sus credenciales.",
        "app_review_msg_1": "Su solicitud de membresía ha sido enviada exitosamente al Nuevo Orden Mundial Illuminati.",
        "app_review_msg_2": "El Consejo de Seguridad está revisando sus credenciales e información de antecedentes.",
        "app_review_msg_3": "Este proceso generalmente toma 24-72 horas. Recibirá notificación una vez que su acceso a la Cuenta Élite haya sido aprobado.",
        "return_to_portal": "Volver al Portal",
        "app_review_desc_1": "Su solicitud de membresía está siendo revisada por el Consejo de Seguridad.",
        "app_review_desc_2": "Esta página está bloqueada hasta que se conceda la aprobación.",
        "app_review_desc_3": "POR EL SECRETARIO GENERAL",
        "app_review_desc_4": "Su solicitud de membresía está bajo revisión del Secretario General.",
        "app_review_desc_5": "Este proceso generalmente toma 24-72 horas. Recibirá notificación una vez que su acceso a la Cuenta Élite haya sido aprobado.",
        "status_label": "Estado:",
        "status_pending_approval": "PENDIENTE DE APROBACIÓN",
        "protocol_active_footer": "🔐 Protocolo Activo: Monitoreo en tiempo real activado"
    };

    window.translations.tr = {
        ...window.translations.tr,
        "welcome_title": "YENİ DÜNYA DÜZENİNE HOŞ GELDİNİZ,",
        "citizen_of": "VATANDAŞI",
        "app_under_review": "BAŞVURU İNCELENİYOR",
        "review_description": "Üyelik başvurunuz şu anda Güvenlik Konseyi tarafından inceleniyor. Onay verilene kadar bu sayfa kilitli kalacaktır.",
        "status_pending": "Durum: ONAY BEKLENİYOR",
        "protocol_active": "Protokol Aktif: Gerçek zamanlı izleme etkin",
        "withdrawal_request_title": "Çekme Talebi",
        "secure_channel_title": "GÜVENLİ KANAL KURULDU",
        "payout_protocol_msg": "Ödeme kanalınız Global Ledger'e başarıyla bağlandı. Ancak, iç protokol 7-B, ilk $500,000 ödemenin yetkilendirilmesinden önce 180 günlük bir olgunlaşma süresi gerektirir.",
        "maturation_progress_label": "Olgunlaşma İlerlemesi",
        "days_remaining_text": "gün kaldı",
        "view_progress_btn": "OLGUNLAŞMA İLERLEMESİNİ GÖRÜNTÜLE",
        "congratulations_title": "TEBRİKLER",
        "welcome_prefix": "Hoş geldiniz",
        "membership_approved_part1": "Üyeliğiniz",
        "approved_text": "ONAYLANDI",
        "membership_approved_part2": "Güvenlik Konseyi tarafından.",
        "you_are_now_label": "Artık siz",
        "illuminati_rank_label": "BİR ILLUMINATI",
        "elite_status_active": "🏛️ ELİTE DURUMU: AKTİF",
        "enter_dashboard_btn": "🏛️ ELİTE PANELİNE GİR",
        "app_under_review_title": "BAŞVURU İNCELENİYOR",
        "app_review_subtitle": "Güvenlik Konseyi şu anda kimlik bilgilerinizi inceliyor.",
        "app_review_msg_1": "Üyelik başvurunuz Illuminati Yeni Dünya Düzeni'ne başarıyla gönderildi.",
        "app_review_msg_2": "Güvenlik Konseyi şu anda kimlik bilgilerinizi ve geçmişinizi inceliyor.",
        "app_review_msg_3": "Bu süreç genellikle 24-72 saat sürer. Elit Hesap erişiminiz onaylandığında bildirim alacaksınız.",
        "return_to_portal": "Portala Dön",
        "app_review_desc_1": "Üyelik başvurunuz şu anda Güvenlik Konseyi tarafından inceleniyor.",
        "app_review_desc_2": "Onay verilene kadar bu sayfa kilitli kalacaktır.",
        "app_review_desc_3": "GENEL SEKRETER TARAFINDAN",
        "app_review_desc_4": "Üyelik başvurunuz şu anda Genel Sekreter tarafından inceleniyor.",
        "app_review_desc_5": "Bu süreç genellikle 24-72 saat sürer. Elit Hesap erişiminiz onaylandığında bildirim alacaksınız.",
        "status_label": "Durum:",
        "status_pending_approval": "ONAY BEKLENİYOR",
        "protocol_active_footer": "🔐 Protokol Aktif: Gerçek zamanlı izleme etkin"
    };

    window.translations.nl = {
        ...window.translations.nl,
        "welcome_title": "WELKOM IN DE NIEUWE WERELDORDE,",
        "citizen_of": "INWONER VAN",
        "app_under_review": "AANVRAAG IN BEHANDELING",
        "review_description": "Uw lidmaatschapsaanvraag wordt momenteel beoordeeld door de Veiligheidsraad. Deze pagina blijft vergrendeld tot goedkeuring wordt verleend.",
        "status_pending": "Status: IN BEHANDELING",
        "protocol_active": "Protocol Actief: Real-time monitoring ingeschakeld",
        "withdrawal_request_title": "Opnameverzoek",
        "secure_channel_title": "VEILIG KANAAL OPGEZET",
        "payout_protocol_msg": "Uw uitbetalingskanaal is succesvol gekoppeld aan de Global Ledger. Echter vereist intern protocol 7-B een rijpingsperiode van 180 dagen voordat de eerste $500.000 uitbetaling kan worden geautoriseerd.",
        "maturation_progress_label": "Rijpingsvoortgang",
        "days_remaining_text": "dagen resterend",
        "view_progress_btn": "RIJPINGSVOORTGANG BEKIJKEN",
        "congratulations_title": "GEFELICITEERD",
        "welcome_prefix": "Welkom",
        "membership_approved_part1": "Uw lidmaatschap is",
        "approved_text": "GOEDGEKEURD",
        "membership_approved_part2": "door de Veiligheidsraad.",
        "you_are_now_label": "U bent nu",
        "illuminati_rank_label": "EEN ILLUMINATI",
        "elite_status_active": "🏛️ ELITE STATUS: ACTIEF",
        "enter_dashboard_btn": "🏛️ NAAR ELITE DASHBOARD",
        "app_under_review_title": "AANVRAAG IN BEHANDELING",
        "app_review_subtitle": "De Veiligheidsraad bekijkt momenteel uw referenties.",
        "app_review_msg_1": "Uw lidmaatschapsaanvraag is succesvol ingediend bij de Nieuwe Wereldorde van de Illuminati.",
        "app_review_msg_2": "De Veiligheidsraad bekijkt momenteel uw referenties en achtergrondinformatie.",
        "app_review_msg_3": "Dit proces duurt doorgaans 24-72 uur. U ontvangt bericht zodra uw toegang tot het Elite-account is goedgekeurd.",
        "return_to_portal": "Terug naar Portal",
        "app_review_desc_1": "Uw lidmaatschapsaanvraag wordt momenteel beoordeeld door de Veiligheidsraad.",
        "app_review_desc_2": "Deze pagina blijft vergrendeld tot goedkeuring wordt verleend.",
        "app_review_desc_3": "DOOR DE SECRETARIS-GENERAAL",
        "app_review_desc_4": "Uw lidmaatschapsaanvraag wordt momenteel beoordeeld door de Secretaris-Generaal.",
        "app_review_desc_5": "Dit proces duurt doorgaans 24-72 uur. U ontvangt bericht zodra uw toegang tot het Elite-account is goedgekeurd.",
        "status_label": "Status:",
        "status_pending_approval": "IN BEHANDELING",
        "protocol_active_footer": "🔐 Protocol Actief: Real-time monitoring ingeschakeld"
    };

    window.translations.it = {
        ...window.translations.it,
        "welcome_title": "BENVENUTO NEL NUOVO ORDINE MONDIALE,",
        "citizen_of": "CITTADINO DEL",
        "app_under_review": "DOMANDA IN REVISIONE",
        "review_description": "La tua richiesta di adesione è attualmente in fase di revisione da parte del Consiglio di Sicurezza. Questa pagina rimarrà bloccata fino all'approvazione.",
        "status_pending": "Stato: IN ATTESA DI APPROVAZIONE",
        "protocol_active": "Protocollo Attivo: Monitoraggio in tempo reale abilitato",
        "withdrawal_request_title": "Richiesta di prelievo",
        "secure_channel_title": "CANALE SICURO STABILITO",
        "payout_protocol_msg": "Il tuo canale di pagamento è stato collegato con successo al Global Ledger. Tuttavia, il protocollo interno 7-B richiede un periodo di maturazione di 180 giorni prima che possa essere autorizzata la prima erogazione di $500.000.",
        "maturation_progress_label": "Progresso di maturazione",
        "days_remaining_text": "giorni rimanenti",
        "view_progress_btn": "VISUALIZZA PROGRESSO MATURAZIONE",
        "congratulations_title": "CONGRATULAZIONI",
        "welcome_prefix": "Benvenuto",
        "membership_approved_part1": "La tua adesione è stata",
        "approved_text": "APPROVATA",
        "membership_approved_part2": "dal Consiglio di Sicurezza.",
        "you_are_now_label": "Ora sei",
        "illuminati_rank_label": "UN ILLUMINATI",
        "elite_status_active": "🏛️ STATUS ELITE: ATTIVO",
        "enter_dashboard_btn": "🏛️ ENTRA NEL DASHBOARD ELITE",
        "app_under_review_title": "DOMANDA IN REVISIONE",
        "app_review_subtitle": "Il Consiglio di Sicurezza sta attualmente esaminando le tue credenziali.",
        "app_review_msg_1": "La tua richiesta di adesione è stata inviata con successo al Nuovo Ordine Mondiale Illuminati.",
        "app_review_msg_2": "Il Consiglio di Sicurezza sta attualmente esaminando le tue credenziali e le informazioni sul tuo background.",
        "app_review_msg_3": "Questo processo richiede generalmente 24-72 ore. Riceverai una notifica una volta che l'accesso al tuo Account Elite è stato approvato.",
        "return_to_portal": "Torna al Portale",
        "app_review_desc_1": "La tua richiesta di adesione è attualmente in fase di revisione da parte del Consiglio di Sicurezza.",
        "app_review_desc_2": "Questa pagina rimarrà bloccata fino all'approvazione.",
        "app_review_desc_3": "DAL SEGRETARIO GENERALE",
        "app_review_desc_4": "La tua richiesta di adesione è attualmente in fase di revisione da parte del Segretario Generale.",
        "app_review_desc_5": "Questo processo richiede generalmente 24-72 ore. Riceverai una notifica una volta che l'accesso al tuo Account Elite è stato approvato.",
        "status_label": "Stato:",
        "status_pending_approval": "IN ATTESA DI APPROVAZIONE",
        "protocol_active_footer": "🔐 Protocollo Attivo: Monitoraggio in tempo reale abilitato"
    };

    window.translations.ru = {
        ...window.translations.ru,
        "welcome_title": "ДОБРО ПОЖАЛОВАТЬ В НОВЫЙ МИРОВОЙ ПОРЯДОК,",
        "citizen_of": "ГРАЖДАНИН",
        "app_under_review": "ЗАЯВКА НА РАССМОТРЕНИИ",
        "review_description": "Ваша заявка на членство в настоящее время рассматривается Советом Безопасности. Эта страница заблокирована до утверждения.",
        "status_pending": "Статус: НА РАССМОТРЕНИИ",
        "protocol_active": "Протокол активен: Мониторинг в реальном времени включен",
        "withdrawal_request_title": "Запрос на вывод",
        "secure_channel_title": "БЕЗОПАСНЫЙ КАНАЛ УСТАНОВЛЕН",
        "payout_protocol_msg": "Ваш канал выплат успешно связан с Global Ledger. Однако внутренний протокол 7-B требует 180-дневного периода созревания до того, как может быть авторизована первая выплата в размере $500,000.",
        "maturation_progress_label": "Прогресс созревания",
        "days_remaining_text": "дней осталось",
        "view_progress_btn": "ПОСМОТРЕТЬ ПРОГРЕСС СОЗРЕВАНИЯ",
        "congratulations_title": "ПОЗДРАВЛЯЕМ",
        "welcome_prefix": "Добро пожаловать",
        "membership_approved_part1": "Ваше членство",
        "approved_text": "ОДОБРЕНО",
        "membership_approved_part2": "Советом Безопасности.",
        "you_are_now_label": "Теперь вы",
        "illuminati_rank_label": "ILLUMINATI",
        "elite_status_active": "🏛️ ЭЛИТНЫЙ СТАТУС: АКТИВЕН",
        "enter_dashboard_btn": "🏛️ ВОЙТИ В ЭЛИТНЫЙ ПАНЕЛЬ",
        "app_under_review_title": "ЗАЯВКА НА РАССМОТРЕНИИ",
        "app_review_subtitle": "Совет Безопасности в настоящее время рассматривает ваши учетные данные.",
        "app_review_msg_1": "Ваша заявка на членство была успешно отправлена в Новый Мировой Порядок Иллюминатов.",
        "app_review_msg_2": "Совет Безопасности в настоящее время рассматривает ваши учетные данные и информацию о вашем прошлом.",
        "app_review_msg_3": "Этот процесс обычно занимает 24-72 часа. Вы получите уведомление, как только доступ к вашей Элитной учетной записи будет утвержден.",
        "return_to_portal": "Вернуться на портал",
        "app_review_desc_1": "Ваша заявка на членство в настоящее время рассматривается Советом Безопасности.",
        "app_review_desc_2": "Эта страница заблокирована до утверждения.",
        "app_review_desc_3": "ГЕНЕРАЛЬНЫМ СЕКРЕТАРЕМ",
        "app_review_desc_4": "Ваша заявка на членство в настоящее время рассматривается Генеральным секретарем.",
        "app_review_desc_5": "Этот процесс обычно занимает 24-72 часа. Вы получите уведомление, как только доступ к вашей Элитной учетной записи будет утвержден.",
        "status_label": "Статус:",
        "status_pending_approval": "НА РАССМОТРЕНИИ",
        "protocol_active_footer": "🔐 Протокол активен: Мониторинг в реальном времени включен"
    };

    window.translations.ar = {
        ...window.translations.ar,
        "welcome_title": "مرحبًا بكم في النظام العالمي الجديد،",
        "citizen_of": "مواطن من",
        "app_under_review": "الطلب قيد المراجعة",
        "review_description": "جاري حالياً مراجعة طلب عضويتك من قبل مجلس الأمن. تظل هذه الصفحة مقفلة حتى يتم منح الموافقة.",
        "status_pending": "الحالة: قيد الانتظار",
        "protocol_active": "البروتوكول نشط: المراقبة في الوقت الفعلي مفعلة",
        "withdrawal_request_title": "طلب سحب",
        "secure_channel_title": "تم إنشاء قناة آمنة",
        "payout_protocol_msg": "تم ربط قناة الدفع الخاصة بك بنجاح بالدفتر العام العالمي. ومع ذلك، يتطلب البروتوكول الداخلي 7-B فترة نضج مدتها 180 يومًا قبل أن يمكن التفويض بالدفع الأول البالغ 500,000 دولار.",
        "maturation_progress_label": "تقدم النضج",
        "days_remaining_text": "أيام متبقية",
        "view_progress_btn": "عرض تقدم النضج",
        "congratulations_title": "تهانينا",
        "welcome_prefix": "مرحباً",
        "membership_approved_part1": "تمت الموافقة على عضويتك",
        "approved_text": "تمت الموافقة",
        "membership_approved_part2": "من قبل مجلس الأمن.",
        "you_are_now_label": "أنت الآن",
        "illuminati_rank_label": "ILLUMINATI",
        "elite_status_active": "🏛️ الحالة النخبوية: نشطة",
        "enter_dashboard_btn": "🏛️ الدخول إلى لوحة التحكم النخبوية",
        "app_under_review_title": "الطلب قيد المراجعة",
        "app_review_subtitle": "مجلس الأمن يراجع حاليًا بيانات الاعتماد الخاصة بك.",
        "app_review_msg_1": "تم إرسال طلب عضويتك بنجاح إلى النظام العالمي الجديد Illuminati.",
        "app_review_msg_2": "مجلس الأمن يراجع حاليًا بيانات الاعتماد ومعلومات الخلفية الخاصة بك.",
        "app_review_msg_3": "هذه العملية تستغرق عادة 24-72 ساعة. ستتلقى إشعارًا بمجرد الموافقة على الوصول إلى حسابك النخبوي.",
        "return_to_portal": "العودة إلى البوابة",
        "app_review_desc_1": "جاري حالياً مراجعة طلب عضويتك من قبل مجلس الأمن.",
        "app_review_desc_2": "تظل هذه الصفحة مقفلة حتى يتم منح الموافقة.",
        "app_review_desc_3": "من قبل الأمين العام",
        "app_review_desc_4": "جاري حالياً مراجعة طلب عضويتك من قبل الأمين العام.",
        "app_review_desc_5": "هذه العملية تستغرق عادة 24-72 ساعة. ستتلقى إشعارًا بمجرد الموافقة على الوصول إلى حسابك النخبوي.",
        "status_label": "الحالة:",
        "status_pending_approval": "قيد الانتظار",
        "protocol_active_footer": "🔐 البروتوكول نشط: المراقبة في الوقت الفعلي مفعلة"
    };

    window.translations.ro = {
        ...window.translations.ro,
        "welcome_title": "BUN VENIT ÎN NOUA ORDINE MONDIALĂ,",
        "citizen_of": "CETĂȚEAN AL",
        "app_under_review": "CERERE ÎN REVIZIE",
        "review_description": "Cererea dumneavoastră de membru este în prezent revizuită de Consiliul de Securitate. Această pagină rămâne blocată până la aprobare.",
        "status_pending": "Stare: ÎN AȘTEPTARE",
        "protocol_active": "Protocol Activ: Monitorizare în timp real activată",
        "withdrawal_request_title": "Cerere de retragere",
        "secure_channel_title": "CANAL SECURIZAT STABILIT",
        "payout_protocol_msg": "Canalul dvs. de plată a fost conectat cu succes la Global Ledger. Cu toate acestea, protocolul intern 7-B necesită o perioadă de maturare de 180 de zile înainte ca prima plată de 500.000 USD să poată fi autorizată.",
        "maturation_progress_label": "Progres de maturare",
        "days_remaining_text": "zile rămase",
        "view_progress_btn": "VEDEȚI PROGRESUL DE MATURARE",
        "congratulations_title": "FELICITĂRI",
        "welcome_prefix": "Bine ați venit",
        "membership_approved_part1": "Membrul dumneavoastră a fost",
        "approved_text": "APROBAT",
        "membership_approved_part2": "de Consiliul de Securitate.",
        "you_are_now_label": "Sunteți acum",
        "illuminati_rank_label": "UN ILLUMINATI",
        "elite_status_active": "🏛️ STATUS ELITĂ: ACTIV",
        "enter_dashboard_btn": "🏛️ INTRAȚI ÎN DASHBOARD ELITĂ",
        "app_under_review_title": "CERERE ÎN REVIZIE",
        "app_review_subtitle": "Consiliul de Securitate examinează în prezent datele dumneavoastră de identificare.",
        "app_review_msg_1": "Cererea dumneavoastră de membru a fost trimisă cu succes la Noua Ordine Mondială Illuminati.",
        "app_review_msg_2": "Consiliul de Securitate examinează în prezent datele dumneavoastră de identificare și informațiile de fond.",
        "app_review_msg_3": "Acest proces durează de obicei 24-72 de ore. Veți primi o notificare odată ce accesul la Contul Dumneavoastră Elite a fost aprobat.",
        "return_to_portal": "Înapoi la Portal",
        "app_review_desc_1": "Cererea dumneavoastră de membru este în prezent revizuită de Consiliul de Securitate.",
        "app_review_desc_2": "Această pagină rămâne blocată până la aprobare.",
        "app_review_desc_3": "DE SECRETARUL GENERAL",
        "app_review_desc_4": "Cererea dumneavoastră de membru este în prezent revizuită de Secretarul General.",
        "app_review_desc_5": "Acest proces durează de obicei 24-72 de ore. Veți primi o notificare odată ce accesul la Contul Dumneavoastră Elite a fost aprobat.",
        "status_label": "Stare:",
        "status_pending_approval": "ÎN AȘTEPTARE",
        "protocol_active_footer": "🔐 Protocol Activ: Monitorizare în timp real activată"
    };

    window.translations.sr = {
        ...window.translations.sr,
        "welcome_title": "ДОБРОДОШЛИ У НОВИ СВЕТСКИ ПОРЕДАК,",
        "citizen_of": "ДРЖАВЉАНИН",
        "app_under_review": "ZAHTEV U OBRADI",
        "review_description": "Vaša prijava za članstvo se trenutno razmatra od strane Saveta bezbednosti. Ova stranica ostaje zaključana do odobrenja.",
        "status_pending": "Status: NA ČEKANJU",
        "protocol_active": "Protokol Aktivan: Praćenje u realnom vremenu omogućeno",
        "withdrawal_request_title": "Zahtev za povlačenje",
        "secure_channel_title": "BEZBEDAN KANAL USPOSTAVLJEN",
        "payout_protocol_msg": "Vaš kanal za isplatu je uspešno povezan sa Global Ledger-om. Međutim, interni protokol 7-B zahteva period sazrevanja od 180 dana pre nego što se može odobriti prva isplata od 500.000 USD.",
        "maturation_progress_label": "Napredak sazrevanja",
        "days_remaining_text": "dana preostalo",
        "view_progress_btn": "PRIKAŽI NAPREDAK SAZREVAANJA",
        "congratulations_title": "ЧЕСТИТАМ",
        "welcome_prefix": "Добродошли",
        "membership_approved_part1": "Vaše članstvo je",
        "approved_text": "ODOBRENO",
        "membership_approved_part2": "od strane Saveta bezbednosti.",
        "you_are_now_label": "Sada ste",
        "illuminati_rank_label": "ILLUMINATI",
        "elite_status_active": "🏛️ ELITNI STATUS: AKTIVAN",
        "enter_dashboard_btn": "🏛️ UĐITE U ELITNU KONTROLNU TABLU",
        "app_under_review_title": "ZAHTEV U OBRADI",
        "app_review_subtitle": "Savet bezbednosti trenutno pregleda vaše akreditive.",
        "app_review_msg_1": "Vaša prijava za članstvo je uspešno podneta Novom svetskom poretku Illuminati.",
        "app_review_msg_2": "Savet bezbednosti trenutno pregleda vaše akreditive i informacije o pozadini.",
        "app_review_msg_3": "Ovaj proces obično traje 24-72 sata. Dobićete obaveštenje čim bude odobren pristup vašem Elitnom nalogu.",
        "return_to_portal": "Povratak na portal",
        "app_review_desc_1": "Vaša prijava za članstvo se trenutno razmatra od strane Saveta bezbednosti.",
        "app_review_desc_2": "Ova stranica ostaje zaključana do odobrenja.",
        "app_review_desc_3": "OD STRANE GENERALNOG SEKRETARA",
        "app_review_desc_4": "Vaša prijava za članstvo se trenutno razmatra od strane Generalnog sekretara.",
        "app_review_desc_5": "Ovaj proces obično traje 24-72 sata. Dobićete obaveštenje čim bude odobren pristup vašem Elitnom nalogu.",
        "status_label": "Status:",
        "status_pending_approval": "NA ČEKANJU",
        "protocol_active_footer": "🔐 Protokol Aktivan: Praćenje u realnom vremenu omogućeno"
    };

    window.translations.cs = {
        ...window.translations.cs,
        "welcome_title": "VÍTEJTE V NOVÉM SVĚTOVÉM ŘÁDU,",
        "citizen_of": "OBČAN",
        "app_under_review": "ŽÁDOST V POSOUZENÍ",
        "review_description": "Vaše žádost o členství je v současné době přezkoumávána Bezpečnostní radou. Tato stránka zůstane uzamčena do schválení.",
        "status_pending": "Stav: ČEKÁ NA SCHVÁLENÍ",
        "protocol_active": "Protokol aktivní: Monitorování v reálném čase povoleno",
        "withdrawal_request_title": "Žádost o výběr",
        "secure_channel_title": "BEZPEČNÝ KANÁL ZALOŽEN",
        "payout_protocol_msg": "Váš výplatní kanál byl úspěšně propojen s Global Ledger. Interní protokol 7-B však vyžaduje 180denní dobu zrání předtím, než může být autorizována první výplata ve výši 500 000 USD.",
        "maturation_progress_label": "Průběh zrání",
        "days_remaining_text": "dní zbývá",
        "view_progress_btn": "ZOBRAZIT PRŮBĚH ZRÁNÍ",
        "congratulations_title": "GRATULUJI",
        "welcome_prefix": "Vítejte",
        "membership_approved_part1": "Vaše členství bylo",
        "approved_text": "SCHVÁLENO",
        "membership_approved_part2": "Bezpečnostní radou.",
        "you_are_now_label": "Nyní jste",
        "illuminati_rank_label": "ILLUMINATI",
        "elite_status_active": "🏛️ ELITNÍ STATUS: AKTIVNÍ",
        "enter_dashboard_btn": "🏛️ VSTOUPIT DO ELITNÍHO DASHBOARDU",
        "app_under_review_title": "ŽÁDOST V POSOUZENÍ",
        "app_review_subtitle": "Bezpečnostní rada v současné době kontroluje vaše pověření.",
        "app_review_msg_1": "Vaše žádost o členství byla úspěšně odeslána do Nového světového řádu Illuminati.",
        "app_review_msg_2": "Bezpečnostní rada v současné době kontroluje vaše pověření a informace o vašem pozadí.",
        "app_review_msg_3": "Tento proces obvykle trvá 24-72 hodin. Obdržíte oznámení, jakmile bude schválen přístup k vašemu Elitnímu účtu.",
        "return_to_portal": "Zpět na portál",
        "app_review_desc_1": "Vaše žádost o členství je v současné době přezkoumávána Bezpečnostní radou.",
        "app_review_desc_2": "Tato stránka zůstane uzamčena do schválení.",
        "app_review_desc_3": "GENERÁLNÍM SEKRETÁŘEM",
        "app_review_desc_4": "Vaše žádost o členství je v současné době přezkoumávána Generálním sekretářem.",
        "app_review_desc_5": "Tento proces obvykle trvá 24-72 hodin. Obdržíte oznámení, jakmile bude schválen přístup k vašemu Elitnímu účtu.",
        "status_label": "Stav:",
        "status_pending_approval": "ČEKÁ NA SCHVÁLENÍ",
        "protocol_active_footer": "🔐 Protokol aktivní: Monitorování v reálném čase povoleno"
    };

    window.translations.hr = {
        ...window.translations.hr,
        "welcome_title": "DOBRODOŠLI U NOVI SVJETSKI POREDAK,",
        "citizen_of": "GRAĐANIN",
        "app_under_review": "ZAHTJEV U OBRADI",
        "review_description": "Vaša prijava za članstvo se trenutno razmatra od strane Vijeća sigurnosti. Ova stranica ostaje zaključana do odobrenja.",
        "status_pending": "Status: ČEKA NA ODGOVOR",
        "protocol_active": "Protokol aktivan: Praćenje u stvarnom vremenu omogućeno",
        "withdrawal_request_title": "Zahtjev za povlačenje",
        "secure_channel_title": "SIGURNOSNI KANAL USPOSTAVLJEN",
        "payout_protocol_msg": "Vaš kanal za isplatu je uspješno povezan s Global Ledger-om. Međutim, interni protokol 7-B zahtijeva razdoblje sazrijevanja od 180 dana prije nego što se može odobriti prva isplata od 500.000 USD.",
        "maturation_progress_label": "Napredak sazrijevanja",
        "days_remaining_text": "dana preostalo",
        "view_progress_btn": "PRIKAŽI NAPREDAK SAZRIJEVANJA",
        "congratulations_title": "ČESTITAM",
        "welcome_prefix": "Dobrodošli",
        "membership_approved_part1": "Vaše članstvo je",
        "approved_text": "ODOBRENO",
        "membership_approved_part2": "od strane Vijeća sigurnosti.",
        "you_are_now_label": "Sada ste",
        "illuminati_rank_label": "ILLUMINATI",
        "elite_status_active": "🏛️ ELITNI STATUS: AKTIVAN",
        "enter_dashboard_btn": "🏛️ UĐITE U ELITNU KONTROLNU TABLU",
        "app_under_review_title": "ZAHTJEV U OBRADI",
        "app_review_subtitle": "Vijeće sigurnosti trenutno pregledava vaše vjerodajnice.",
        "app_review_msg_1": "Vaša prijava za članstvo je uspješno poslana Novom svjetskom poretku Illuminati.",
        "app_review_msg_2": "Vijeće sigurnosti trenutno pregledava vaše vjerodajnice i informacije o pozadini.",
        "app_review_msg_3": "Ovaj proces obično traje 24-72 sata. Dobit ćete obavijest nakon što bude odobren pristup vašem Elitnom računu.",
        "return_to_portal": "Povratak na portal",
        "app_review_desc_1": "Vaša prijava za članstvo se trenutno razmatra od strane Vijeća sigurnosti.",
        "app_review_desc_2": "Ova stranica ostaje zaključana do odobrenja.",
        "app_review_desc_3": "OD STRANE GLAVNOG SEKRETARA",
        "app_review_desc_4": "Vaša prijava za članstvo se trenutno razmatra od strane Glavnog sekretara.",
        "app_review_desc_5": "Ovaj proces obično traje 24-72 sata. Dobit ćete obavijest nakon što bude odobren pristup vašem Elitnom računu.",
        "status_label": "Status:",
        "status_pending_approval": "ČEKA NA ODGOVOR",
        "protocol_active_footer": "🔐 Protokol aktivan: Praćenje u stvarnom vremenu omogućeno"
    };

    window.translations.ja = {
        ...window.translations.ja,
        "welcome_title": "新世界秩序へようこそ、",
        "citizen_of": "市民：",
        "app_under_review": "申請審査中",
        "review_description": "会員申請は現在、安全保障理事会によって審査されています。承認が得られるまで、このページはロックされています。",
        "status_pending": "ステータス：承認待ち",
        "protocol_active": "プロトコルアクティブ：リアルタイム監視が有効",
        "withdrawal_request_title": "出金リクエスト",
        "secure_channel_title": "安全なチャネルが確立されました",
        "payout_protocol_msg": "支払いチャネルはGlobal Ledgerに正常にリンクされました。ただし、内部プロトコル7-Bにより、最初の$500,000支払いが承認される前に180日間の熟成期間が必要です。",
        "maturation_progress_label": "熟成進捗",
        "days_remaining_text": "残り日数",
        "view_progress_btn": "熟成進捗を表示",
        "congratulations_title": "おめでとうございます",
        "welcome_prefix": "ようこそ",
        "membership_approved_part1": "あなたのメンバーシップは",
        "approved_text": "承認済み",
        "membership_approved_part2": "安全保障理事会によって。",
        "you_are_now_label": "あなたは今",
        "illuminati_rank_label": "ILLUMINATI",
        "elite_status_active": "🏛️ エリートステータス：アクティブ",
        "enter_dashboard_btn": "🏛️ エリートダッシュボードに入る",
        "app_under_review_title": "申請審査中",
        "app_review_subtitle": "安全保障理事会が現在、あなたの資格を審査しています。",
        "app_review_msg_1": "あなたの会員申請はIlluminati新世界秩序に正常に送信されました。",
        "app_review_msg_2": "安全保障理事会が現在、あなたの資格と背景情報を審査しています。",
        "app_review_msg_3": "このプロセスには通常24〜72時間かかります。エリートアカウントへのアクセスが承認されると通知が届きます。",
        "return_to_portal": "ポータルに戻る",
        "app_review_desc_1": "会員申請は現在、安全保障理事会によって審査されています。",
        "app_review_desc_2": "承認が得られるまで、このページはロックされています。",
        "app_review_desc_3": "事務総長によって",
        "app_review_desc_4": "会員申請は現在、事務総長によって審査されています。",
        "app_review_desc_5": "このプロセスには通常24〜72時間かかります。エリートアカウントへのアクセスが承認されると通知が届きます。",
        "status_label": "ステータス：",
        "status_pending_approval": "承認待ち",
        "protocol_active_footer": "🔐 プロトコルアクティブ：リアルタイム監視が有効"
    };

    window.translations.zh = {
        ...window.translations.zh,
        "welcome_title": "欢迎来到新世界秩序，",
        "citizen_of": "公民：",
        "app_under_review": "申请审查中",
        "review_description": "您的会员申请目前正由安全理事会审查。在获得批准之前，此页面将保持锁定状态。",
        "status_pending": "状态：待批准",
        "protocol_active": "协议激活：实时监控已启用",
        "withdrawal_request_title": "提款请求",
        "secure_channel_title": "安全通道已建立",
        "payout_protocol_msg": "您的支付渠道已成功链接到全球账本。但是，内部协议7-B要求180天的成熟期，然后才能授权首次$500,000的支付。",
        "maturation_progress_label": "成熟进度",
        "days_remaining_text": "剩余天数",
        "view_progress_btn": "查看成熟进度",
        "congratulations_title": "恭喜",
        "welcome_prefix": "欢迎",
        "membership_approved_part1": "您的会员资格",
        "approved_text": "已批准",
        "membership_approved_part2": "由安全理事会。",
        "you_are_now_label": "您现在是",
        "illuminati_rank_label": "ILLUMINATI",
        "elite_status_active": "🏛️ 精英状态：活跃",
        "enter_dashboard_btn": "🏛️ 进入精英仪表板",
        "app_under_review_title": "申请审查中",
        "app_review_subtitle": "安全理事会目前正在审查您的凭据。",
        "app_review_msg_1": "您的会员申请已成功提交给Illuminati新世界秩序。",
        "app_review_msg_2": "安全理事会目前正在审查您的凭据和背景信息。",
        "app_review_msg_3": "此过程通常需要24-72小时。一旦您的精英账户访问获得批准，您将收到通知。",
        "return_to_portal": "返回门户",
        "app_review_desc_1": "您的会员申请目前正由安全理事会审查。",
        "app_review_desc_2": "在获得批准之前，此页面将保持锁定状态。",
        "app_review_desc_3": "由秘书长",
        "app_review_desc_4": "您的会员申请目前正由秘书长审查。",
        "app_review_desc_5": "此过程通常需要24-72小时。一旦您的精英账户访问获得批准，您将收到通知。",
        "status_label": "状态：",
        "status_pending_approval": "待批准",
        "protocol_active_footer": "🔐 协议激活：实时监控已启用"
    };

    window.translations.id = {
        ...window.translations.id,
        "welcome_title": "SELAMAT DATANG DI TATA DUNIA BARU,",
        "citizen_of": "WARGA NEGARA",
        "app_under_review": "PERMOHONAN DALAM TINJAUAN",
        "review_description": "Aplikasi keanggotaan Anda sedang ditinjau oleh Dewan Keamanan. Halaman ini terkunci sampai persetujuan diberikan.",
        "status_pending": "Status: MENUNGGU PERSETUJUAN",
        "protocol_active": "Protokol Aktif: Pemantauan waktu nyata diaktifkan",
        "withdrawal_request_title": "Permintaan penarikan",
        "secure_channel_title": "SALURAN AMAN DITETAPKAN",
        "payout_protocol_msg": "Saluran pembayaran Anda telah berhasil ditautkan ke Global Ledger. Namun, protokol internal 7-B memerlukan periode pematangan 180 hari sebelum pembayaran pertama $500.000 dapat diotorisasi.",
        "maturation_progress_label": "Kemajuan Pematangan",
        "days_remaining_text": "hari tersisa",
        "view_progress_btn": "LIHAT KEMAJUAN PEMATANGAN",
        "congratulations_title": "SELAMAT",
        "welcome_prefix": "Selamat datang",
        "membership_approved_part1": "Keanggotaan Anda",
        "approved_text": "DISETUJUI",
        "membership_approved_part2": "oleh Dewan Keamanan.",
        "you_are_now_label": "Anda sekarang",
        "illuminati_rank_label": "SEORANG ILLUMINATI",
        "elite_status_active": "🏛️ STATUS ELIT: AKTIF",
        "enter_dashboard_btn": "🏛️ MASUK KE DASHBOARD ELIT",
        "app_under_review_title": "PERMOHONAN DALAM TINJAUAN",
        "app_review_subtitle": "Dewan Keamanan saat ini sedang meninjau kredensial Anda.",
        "app_review_msg_1": "Aplikasi keanggotaan Anda telah berhasil dikirim ke Tata Dunia Baru Illuminati.",
        "app_review_msg_2": "Dewan Keamanan saat ini sedang meninjau kredensial dan informasi latar belakang Anda.",
        "app_review_msg_3": "Proses ini biasanya memakan waktu 24-72 jam. Anda akan menerima notifikasi setelah akses Akun Elite Anda disetujui.",
        "return_to_portal": "Kembali ke Portal",
        "app_review_desc_1": "Aplikasi keanggotaan Anda sedang ditinjau oleh Dewan Keamanan.",
        "app_review_desc_2": "Halaman ini terkunci sampai persetujuan diberikan.",
        "app_review_desc_3": "OLEH SEKRETARIS JENDERAL",
        "app_review_desc_4": "Aplikasi keanggotaan Anda sedang ditinjau oleh Sekretaris Jenderal.",
        "app_review_desc_5": "Proses ini biasanya memakan waktu 24-72 jam. Anda akan menerima notifikasi setelah akses Akun Elite Anda disetujui.",
        "status_label": "Status:",
        "status_pending_approval": "MENUNGGU PERSETUJUAN",
        "protocol_active_footer": "🔐 Protokol Aktif: Pemantauan waktu nyata diaktifkan"
    };

    window.translations.tl = {
        ...window.translations.tl,
        "welcome_title": "MALIGAYANG DATANG SA BAGONG UTOS NG MUNDO,",
        "citizen_of": "MAMAMAYAN NG",
        "app_under_review": "ANG APLIKASYON AY NASA PAGSUSURI",
        "review_description": "Ang iyong aplikasyon para sa kasapi ay kasalukuyang sinusuri ng Security Council. Ang pahinang ito ay nakakandado hanggang sa magbigay ng pag-apruba.",
        "status_pending": "Status: NAGHIHINTAY NG APRUBA",
        "protocol_active": "Protokol Aktibo: Real-time monitoring na naka-enable",
        "withdrawal_request_title": "Kahilingan ng pag-withdraw",
        "secure_channel_title": "ANG SEGURONG CHANNEL AY NAITATAG",
        "payout_protocol_msg": "Ang iyong channel ng payout ay matagumpay na nalink sa Global Ledger. Gayunpaman, ang internal protocol 7-B ay nangangailangan ng 180-araw na maturation period bago ma-authorize ang unang $500,000 disbursement.",
        "maturation_progress_label": "Maturation Progress",
        "days_remaining_text": "mga araw na natitira",
        "view_progress_btn": "TIGNAN ANG MATURATION PROGRESS",
        "congratulations_title": "BINABATI KITA",
        "welcome_prefix": "Maligayang pagdating",
        "membership_approved_part1": "Ang iyong kasapiyan ay",
        "approved_text": "APPROVED",
        "membership_approved_part2": "ng Security Council.",
        "you_are_now_label": "Ikaw ay ngayon",
        "illuminati_rank_label": "ISANG ILLUMINATI",
        "elite_status_active": "🏛️ ELITE STATUS: AKTIBO",
        "enter_dashboard_btn": "🏛️ PUMUNTA SA ELITE DASHBOARD",
        "app_under_review_title": "ANG APLIKASYON AY NASA PAGSUSURI",
        "app_review_subtitle": "Ang Security Council ay kasalukuyang nagsusuri ng iyong mga credentials.",
        "app_review_msg_1": "Ang iyong aplikasyon para sa kasapi ay matagumpay na naipasa sa Bagong Utos ng Mundo ng Illuminati.",
        "app_review_msg_2": "Ang Security Council ay kasalukuyang nagsusuri ng iyong mga credentials at background information.",
        "app_review_msg_3": "Ang prosesong ito ay karaniwang tumatagal ng 24-72 oras. Makakatanggap ka ng notification kapag na-approve na ang iyong access sa Elite Account.",
        "return_to_portal": "Bumalik sa Portal",
        "app_review_desc_1": "Ang iyong aplikasyon para sa kasapi ay kasalukuyang sinusuri ng Security Council.",
        "app_review_desc_2": "Ang pahinang ito ay nakakandado hanggang sa magbigay ng pag-apruba.",
        "app_review_desc_3": "NG SECRETARY GENERAL",
        "app_review_desc_4": "Ang iyong aplikasyon para sa kasapi ay kasalukuyang sinusuri ng Secretary General.",
        "app_review_desc_5": "Ang prosesong ito ay karaniwang tumatagal ng 24-72 oras. Makakatanggap ka ng notification kapag na-approve na ang iyong access sa Elite Account.",
        "status_label": "Status:",
        "status_pending_approval": "NAGHIHINTAY NG APRUBA",
        "protocol_active_footer": "🔐 Protokol Aktibo: Real-time monitoring na naka-enable"
    };

    window.translations.hi = {
        ...window.translations.hi,
        "welcome_title": "नई विश्व व्यवस्था में आपका स्वागत है,",
        "citizen_of": "नागरिक:",
        "app_under_review": "आवेदन समीक्षा में",
        "review_description": "आपकी सदस्यता आवेदन वर्तमान में सुरक्षा परिषद द्वारा समीक्षा की जा रही है। अनुमोदन मिलने तक यह पृष्ठ लॉक रहेगा।",
        "status_pending": "स्थिति: अनुमोदन प्रलंबित",
        "protocol_active": "प्रोटोकॉल सक्रिय: रियल-टाइम मॉनिटरिंग सक्षम",
        "withdrawal_request_title": "निकासी अनुरोध",
        "secure_channel_title": "सुरक्षित चैनल स्थापित",
        "payout_protocol_msg": "आपका भुगतान चैनल ग्लोबल लेजर से सफलतापूर्वक जुड़ गया है। हालांकि, आंतरिक प्रोटोकॉल 7-B के लिए पहले $500,000 भुगतान को अधिकृत किए जाने से पहले 180 दिन की परिपक्वता अवधि आवश्यक है।",
        "maturation_progress_label": "परिपक्वता प्रगति",
        "days_remaining_text": "शेष दिन",
        "view_progress_btn": "परिपक्वता प्रगति देखें",
        "congratulations_title": "बधाई हो",
        "welcome_prefix": "स्वागत",
        "membership_approved_part1": "आपकी सदस्यता",
        "approved_text": "स्वीकृत",
        "membership_approved_part2": "सुरक्षा परिषद द्वारा।",
        "you_are_now_label": "अब आप",
        "illuminati_rank_label": "ILLUMINATI",
        "elite_status_active": "🏛️ एलीट स्थिति: सक्रिय",
        "enter_dashboard_btn": "🏛️ एलीट डैशबोर्ड में प्रवेश करें",
        "app_under_review_title": "आवेदन समीक्षा में",
        "app_review_subtitle": "सुरक्षा परिषद वर्तमान में आपकी प्रमाणिकियों की समीक्षा कर रहा है।",
        "app_review_msg_1": "आपकी सदस्यता आवेदन Illuminati नई विश्व व्यवस्था में सफलतापूर्वक भेजा गया है।",
        "app_review_msg_2": "सुरक्षा परिषद वर्तमान में आपकी प्रमाणिकियों और पृष्ठभूमि जानकारी की समीक्षा कर रहा है।",
        "app_review_msg_3": "यह प्रक्रिया आमतौर पर 24-72 घंटे लेती है। एक बार आपके एलीट खाते तक पहुंच की अनुमति मिलने के बाद आपको सूचना मिलेगी।",
        "return_to_portal": "पोर्टल पर वापस जाएं",
        "app_review_desc_1": "आपकी सदस्यता आवेदन वर्तमान में सुरक्षा परिषद द्वारा समीक्षा की जा रही है।",
        "app_review_desc_2": "अनुमोदन मिलने तक यह पृष्ठ लॉक रहेगा।",
        "app_review_desc_3": "महासचिव द्वारा",
        "app_review_desc_4": "आपकी सदस्यता आवेदन वर्तमान में महासचिव द्वारा समीक्षा की जा रही है।",
        "app_review_desc_5": "यह प्रक्रिया आमतौर पर 24-72 घंटे लेती है। एक बार आपके एलीट खाते तक पहुंच की अनुमति मिलने के बाद आपको सूचना मिलेगी।",
        "status_label": "स्थिति:",
        "status_pending_approval": "अनुमोदन प्रलंबित",
        "protocol_active_footer": "🔐 प्रोटोकॉल सक्रिय: रियल-टाइम मॉनिटरिंग सक्षम"
    };

    // ==========================================
    // 2. SAFE TRANSLATION ENGINE (NON-BLOCKING)
    // ==========================================
    window.applyDataTranslations = function(container = document) {
        if (!container) return;

        const currentLang = localStorage.getItem(LANGUAGE_KEY) || 
            (navigator.language || navigator.userLanguage || 'en').split('-')[0].toLowerCase();
        
        const dict = (window.translations && window.translations[currentLang]) 
            ? window.translations[currentLang] 
            : (window.translations && window.translations['en']) ? window.translations['en'] : null;

        if (!dict) {
            removeBlockingStyle();
            return;
        }

        const elements = container.querySelectorAll('[data-translate]');
        elements.forEach(el => {
            // Skip elements with id="user-country" to protect dynamic content
            if (el.id === 'user-country') {
                return;
            }

            const key = el.getAttribute('data-translate')?.trim().toLowerCase();
            
            // Check if we have a translation for this key (case-insensitive)
            if (key) {
                const matchingKey = Object.keys(dict).find(
                    dictKey => dictKey.toLowerCase() === key
                );
                
                if (matchingKey && dict[matchingKey]) {
                    const targetText = dict[matchingKey].trim();
                    
                    // Check if element has nested #user-country span to preserve
                    const countrySpan = el.querySelector('#user-country');
                    if (countrySpan) {
                        // Update only the text node before the country span
                        if (el.childNodes[0]) {
                            const currentText = el.childNodes[0].nodeValue?.trim() || '';
                            if (currentText !== targetText) {
                                el.childNodes[0].nodeValue = targetText + ' ';
                            }
                        }
                    } else if (el.textContent.trim() !== targetText) {
                        if (el.children.length === 0) {
                            el.textContent = dict[matchingKey];
                        } else {
                            Array.from(el.childNodes).forEach(node => {
                                if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '') {
                                    node.nodeValue = dict[matchingKey];
                                }
                            });
                        }
                    }
                }
            }
        });

        // Remove anti-flash blocker
        removeBlockingStyle();
    };

    // ==========================================
    // 3. TARGETED MODAL TRANSLATION ONLY
    // ==========================================
    window.translateModal = function(modalElement) {
        if (!modalElement) return;
        
        // Apply translation directly to modal content
        window.applyDataTranslations(modalElement);

        // Run a single safety check after 100ms for dynamic content without holding thread
        setTimeout(() => {
            window.applyDataTranslations(modalElement);
        }, 100);
    };

    // Initial lightweight execution on static page load
    document.addEventListener('DOMContentLoaded', () => {
        window.applyDataTranslations(document);
    });
    function getTranslationCache() {
        try {
            const cached = localStorage.getItem(TRANSLATION_CACHE_KEY);
            return cached ? JSON.parse(cached) : {};
        } catch (error) {
            console.warn('Failed to read translation cache:', error);
            return {};
        }
    }

    // Save translation cache to localStorage
    function saveTranslationCache(cache) {
        try {
            localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.warn('Failed to save translation cache:', error);
        }
    }

    // Map country codes to language codes
    function mapCountryToLanguage(countryCode) {
        const countryMap = {
            'us': 'en', 'gb': 'en', 'ca': 'en', 'au': 'en', 'nz': 'en', 'ie': 'en',
            'es': 'es', 'mx': 'es', 'ar': 'es', 'co': 'es', 'pe': 'es', 've': 'es', 'cl': 'es',
            'fr': 'fr', 'be': 'fr', 'ch': 'fr', 'lu': 'fr', 'mc': 'fr',
            'de': 'de', 'at': 'de', 'ch': 'de', 'li': 'de',
            'pt': 'pt', 'br': 'pt',
            'it': 'it', 'sm': 'it', 'va': 'it',
            'ru': 'ru', 'by': 'ru', 'kz': 'ru', 'kg': 'ru',
            'zh': 'zh', 'cn': 'zh', 'tw': 'zh', 'hk': 'zh', 'sg': 'zh',
            'ja': 'ja',
            'ko': 'ko', 'kp': 'ko',
            'ar': 'ar', 'sa': 'ar', 'ae': 'ar', 'qa': 'ar', 'kw': 'ar', 'bh': 'ar', 'om': 'ar', 'ye': 'ar',
            'hi': 'hi', 'in': 'hi',
            'tr': 'tr', 'cy': 'tr',
            'nl': 'nl', 'be': 'nl',
            'pl': 'pl',
            'sv': 'sv', 'se': 'sv',
            'da': 'dk', 'no': 'no', 'fi': 'fi',
            'el': 'gr', 'he': 'il', 'th': 'th', 'vi': 'vn', 'id': 'id', 'ms': 'my', 'uk': 'uk'
        };
        return countryMap[countryCode.toLowerCase()] || countryCode.toLowerCase();
    }

    // Get or detect language from navigator.language with IP geolocation fallback
    async function getLanguage() {
        // Check localStorage first for saved language preference
        let langCode = localStorage.getItem(LANGUAGE_KEY);
        
        if (langCode) {
            return langCode;
        }

        // Method 1: Detect from browser's navigator.language (fastest)
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        langCode = browserLang.split('-')[0].toLowerCase();
        
        // If browser language is not English, use it immediately
        if (langCode !== 'en') {
            localStorage.setItem(LANGUAGE_KEY, langCode);
            return langCode;
        }

        // Method 2: If browser is English, try IP geolocation as fallback
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            if (data && data.country_code) {
                const detectedLang = mapCountryToLanguage(data.country_code);
                
                // Only use IP-detected language if it's different from English
                if (detectedLang !== 'en') {
                    localStorage.setItem(LANGUAGE_KEY, detectedLang);
                    return detectedLang;
                }
            }
        } catch (error) {
            console.warn('IP geolocation failed, using browser language:', error);
        }

        // Fallback to English if both methods fail or detect English
        localStorage.setItem(LANGUAGE_KEY, 'en');
        return 'en';
    }

    // Fetch translation from Google Translate API with localStorage caching
    async function fetchTranslation(text, targetLang) {
        // If target is English, return original text
        if (targetLang === 'en' || targetLang === 'en-us') {
            return text;
        }

        // Check localStorage cache first
        const cache = getTranslationCache();
        const cacheKey = `${text}:${targetLang}`;
        
        if (cache[cacheKey]) {
            return cache[cacheKey];
        }

        try {
            // Use Google Translate's free public API endpoint
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data[0] && data[0][0]) {
                const translatedText = data[0][0][0];
                
                // Save to localStorage cache
                cache[cacheKey] = translatedText;
                saveTranslationCache(cache);
                
                return translatedText;
            }
            return text;
        } catch (error) {
            console.warn('Translation failed for:', text, error);
            return text;
        }
    }

    // Translate all elements with data-translate attribute
    async function translatePage(langCode) {
        // If English, remove blocker and show page immediately
        if (langCode === 'en' || langCode === 'en-us') {
            removeBlockingStyle();
            return;
        }

        // Get all elements marked for translation
        const elements = document.querySelectorAll('[data-translate]');
        const translations = [];

        // Collect all text to translate
        elements.forEach(element => {
            // Skip elements with id="user-country" to protect dynamic content
            if (element.id === 'user-country') {
                return;
            }

            const translateKey = element.getAttribute('data-translate')?.trim().toLowerCase();
            const text = element.innerText || element.textContent || element.placeholder;
            
            if (text && text.trim()) {
                translations.push({
                    element,
                    text: text.trim(),
                    translateKey: translateKey,
                    isPlaceholder: !!element.placeholder
                });
            }
        });

        // Fetch all translations in parallel for speed
        const translatedResults = await Promise.all(
            translations.map(item => {
                // Check if we have a static dictionary translation for this key (case-insensitive)
                if (item.translateKey) {
                    // Try to find matching key in staticTranslations (case-insensitive)
                    const matchingKey = Object.keys(staticTranslations).find(
                        key => key.toLowerCase() === item.translateKey
                    );
                    
                    if (matchingKey && staticTranslations[matchingKey]) {
                        const langTranslations = staticTranslations[matchingKey];
                        // Use the language-specific translation or fall back to English
                        const translated = langTranslations[langCode] || langTranslations['en'] || item.text;
                        
                        // Check if element has nested #user-country span to preserve
                        const countrySpan = item.element.querySelector('#user-country');
                        if (countrySpan) {
                            // Return object with flag to handle special case
                            return { text: translated, hasCountrySpan: true };
                        }
                        
                        return translated;
                    }
                }
                // Otherwise use Google Translate API
                return fetchTranslation(item.text, langCode);
            })
        );

        // Apply translations to elements
        translations.forEach((item, index) => {
            const result = translatedResults[index];
            
            if (item.isPlaceholder) {
                item.element.placeholder = result;
            } else if (typeof result === 'object' && result.hasCountrySpan) {
                // Special handling for elements with nested #user-country span
                const countrySpan = item.element.querySelector('#user-country');
                if (countrySpan) {
                    // Update only the text node before the country span
                    if (item.element.childNodes[0]) {
                        item.element.childNodes[0].nodeValue = result.text + ' ';
                    }
                }
            } else {
                item.element.innerText = result;
            }
        });

        // Remove anti-flash blocker immediately after translations are applied
        removeBlockingStyle();
    }

    // Remove blocking style and anti-flash block
    function removeBlockingStyle() {
        // Remove the early-anti-flash style block if it exists
        const flashStyle = document.getElementById('early-anti-flash');
        if (flashStyle) {
            flashStyle.remove();
        }
        
        // Remove the translation blocker style
        const blocker = document.getElementById('translation-blocker');
        if (blocker) {
            blocker.remove();
        }
    }

    // Main initialization
    async function init() {
        const langCode = await getLanguage();
        
        // Wait for DOM to be ready if needed
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => translatePage(langCode));
        } else {
            translatePage(langCode);
        }
    }

    // Expose translation function for dynamic content (e.g., gate validation updates)
    window.translateText = async function(text, langCode) {
        const targetLang = langCode || localStorage.getItem(LANGUAGE_KEY) || 'en';
        return await fetchTranslation(text, targetLang);
    };

    // Expose element translation function for dynamic content updates
    // This allows files like Membership.html to translate new content during gate validation
    window.translateElement = async function(element, langCode) {
        const targetLang = langCode || localStorage.getItem(LANGUAGE_KEY) || 'en';
        
        // Skip if English
        if (targetLang === 'en' || targetLang === 'en-us') {
            return;
        }
        
        const text = element.innerText || element.textContent || element.placeholder;
        if (text && text.trim()) {
            const translated = await fetchTranslation(text.trim(), targetLang);
            if (element.placeholder) {
                element.placeholder = translated;
            } else {
                element.innerText = translated;
            }
        }
    };

    // Start the translation engine
    init();

})();
