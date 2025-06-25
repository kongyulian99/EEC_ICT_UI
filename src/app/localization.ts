// DevExtreme Globalize integration
import 'devextreme/localization/globalize/number';
import 'devextreme/localization/globalize/date';
import 'devextreme/localization/globalize/currency';
import 'devextreme/localization/globalize/message';

// DevExtreme messages (en messages already included)
import enMessages from 'devextreme/localization/messages/en.json';

// CLDR data
import enCldrData from 'devextreme-cldr-data/en.json';
import supplementalCldrData from 'devextreme-cldr-data/supplemental.json';

import Globalize from 'globalize';

Globalize.load(
    enCldrData,
    supplementalCldrData
);

Globalize.loadMessages(enMessages);

Globalize.locale('en');
