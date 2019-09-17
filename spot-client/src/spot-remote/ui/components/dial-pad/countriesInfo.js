const countriesInfo = [
    {
        code: 'US',
        name: 'United States',
        number: '1'
    },
    {
        code: 'AF',
        name: 'Afghanistan',
        number: '93'
    },
    {
        code: 'AX',
        name: 'Åland Islands',
        number: '358'
    },
    {
        code: 'AL',
        name: 'Albania',
        number: '355'
    },
    {
        code: 'DZ',
        name: 'Algeria',
        number: '213'
    },
    {
        code: 'AS',
        name: 'American Samoa',
        number: '1'
    },
    {
        code: 'AD',
        name: 'Andorra',
        number: '376'
    },
    {
        code: 'AO',
        name: 'Angola',
        number: '244'
    },
    {
        code: 'AI',
        name: 'Anguilla',
        number: '1'
    },
    {
        code: 'AG',
        name: 'Antigua and Barbuda',
        number: '1'
    },
    {
        code: 'AR',
        name: 'Argentina',
        number: '54'
    },
    {
        code: 'AM',
        name: 'Armenia',
        number: '374'
    },
    {
        code: 'AW',
        name: 'Aruba',
        number: '297'
    },
    {
        code: 'AU',
        name: 'Australia',
        number: '61'
    },
    {
        code: 'AT',
        name: 'Austria',
        number: '43'
    },
    {
        code: 'AZ',
        name: 'Azerbaijan',
        number: '994'
    },
    {
        code: 'BS',
        name: 'Bahamas',
        number: '1'
    },
    {
        code: 'BH',
        name: 'Bahrain',
        number: '973'
    },
    {
        code: 'BD',
        name: 'Bangladesh',
        number: '880'
    },
    {
        code: 'BB',
        name: 'Barbados',
        number: '1'
    },
    {
        code: 'BY',
        name: 'Belarus',
        number: '375'
    },
    {
        code: 'BE',
        name: 'Belgium',
        number: '32'
    },
    {
        code: 'BZ',
        name: 'Belize',
        number: '501'
    },
    {
        code: 'BJ',
        name: 'Benin',
        number: '229'
    },
    {
        code: 'BM',
        name: 'Bermuda',
        number: '1'
    },
    {
        code: 'BT',
        name: 'Bhutan',
        number: '975'
    },
    {
        code: 'BO',
        name: 'Bolivia',
        number: '591'
    },
    {
        code: 'BA',
        name: 'Bosnia and Herzegovina',
        number: '387'
    },
    {
        code: 'BW',
        name: 'Botswana',
        number: '267'
    },
    {
        code: 'BR',
        name: 'Brazil',
        number: '55'
    },
    {
        code: 'IO',
        name: 'British Indian Ocean Territory',
        number: '246'
    },
    {
        code: 'VG',
        name: 'British Virgin Islands',
        number: '1'
    },
    {
        code: 'BN',
        name: 'Brunei',
        number: '673'
    },
    {
        code: 'BG',
        name: 'Bulgaria',
        number: '359'
    },
    {
        code: 'BF',
        name: 'Burkina Faso',
        number: '226'
    },
    {
        code: 'BI',
        name: 'Burundi',
        number: '257'
    },
    {
        code: 'KH',
        name: 'Cambodia',
        number: '855'
    },
    {
        code: 'CM',
        name: 'Cameroon',
        number: '237'
    },
    {
        code: 'CA',
        name: 'Canada',
        number: '1'
    },
    {
        code: 'CV',
        name: 'Cape Verde',
        number: '238'
    },
    {
        code: 'BQ',
        name: 'Caribbean Netherlands',
        number: '599'
    },
    {
        code: 'KY',
        name: 'Cayman Islands',
        number: '1'
    },
    {
        code: 'CF',
        name: 'Central African Republic',
        number: '236'
    },
    {
        code: 'TD',
        name: 'Chad',
        number: '235'
    },
    {
        code: 'CL',
        name: 'Chile',
        number: '56'
    },
    {
        code: 'CN',
        name: 'China',
        number: '86'
    },
    {
        code: 'CX',
        name: 'Christmas Island',
        number: '61'
    },
    {
        code: 'CC',
        name: 'Cocos Keeling Islands',
        number: '61'
    },
    {
        code: 'CO',
        name: 'Colombia',
        number: '57'
    },
    {
        code: 'KM',
        name: 'Comoros',
        number: '269'
    },
    {
        code: 'CD',
        name: 'Democratic Republic Congo',
        number: '243'
    },
    {
        code: 'CG',
        name: 'Republic of Congo',
        number: '242'
    },
    {
        code: 'CK',
        name: 'Cook Islands',
        number: '682'
    },
    {
        code: 'CR',
        name: 'Costa Rica',
        number: '506'
    },
    {
        code: 'CI',
        name: 'Côte d\'Ivoire',
        number: '225'
    },
    {
        code: 'HR',
        name: 'Croatia',
        number: '385'
    },
    {
        code: 'CU',
        name: 'Cuba',
        number: '53'
    },
    {
        code: 'CW',
        name: 'Curaçao',
        number: '599'
    },
    {
        code: 'CY',
        name: 'Cyprus',
        number: '357'
    },
    {
        code: 'CZ',
        name: 'Czech Republic',
        number: '420'
    },
    {
        code: 'DK',
        name: 'Denmark',
        number: '45'
    },
    {
        code: 'DJ',
        name: 'Djibouti',
        number: '253'
    },
    {
        code: 'DM',
        name: 'Dominica',
        number: '1'
    },
    {
        code: 'DO',
        name: 'Dominican Republic',
        number: '1'
    },
    {
        code: 'TL',
        name: 'East Timor',
        number: '670'
    },
    {
        code: 'EC',
        name: 'Ecuador',
        number: '593'
    },
    {
        code: 'EG',
        name: 'Egypt',
        number: '20'
    },
    {
        code: 'SV',
        name: 'El Salvador',
        number: '503'
    },
    {
        code: 'GQ',
        name: 'Equatorial Guinea',
        number: '240'
    },
    {
        code: 'ER',
        name: 'Eritrea',
        number: '291'
    },
    {
        code: 'EE',
        name: 'Estonia',
        number: '372'
    },
    {
        code: 'ET',
        name: 'Ethiopia',
        number: '251'
    },
    {
        code: 'FK',
        name: 'Falkland Islands (Islas Malvinas)',
        number: '500'
    },
    {
        code: 'FO',
        name: 'Faroe Islands',
        number: '298'
    },
    {
        code: 'FJ',
        name: 'Fiji',
        number: '679'
    },
    {
        code: 'FI',
        name: 'Finland',
        number: '358'
    },
    {
        code: 'FR',
        name: 'France',
        number: '33'
    },
    {
        code: 'GF',
        name: 'French Guiana',
        number: '594'
    },
    {
        code: 'PF',
        name: 'French Polynesia',
        number: '689'
    },
    {
        code: 'GA',
        name: 'Gabon',
        number: '241'
    },
    {
        code: 'GM',
        name: 'Gambia',
        number: '220'
    },
    {
        code: 'GE',
        name: 'Georgia',
        number: '995'
    },
    {
        code: 'DE',
        name: 'Germany',
        number: '49'
    },
    {
        code: 'GH',
        name: 'Ghana',
        number: '233'
    },
    {
        code: 'GI',
        name: 'Gibraltar',
        number: '350'
    },
    {
        code: 'GR',
        name: 'Greece',
        number: '30'
    },
    {
        code: 'GL',
        name: 'Greenland',
        number: '299'
    },
    {
        code: 'GD',
        name: 'Grenada',
        number: '1'
    },
    {
        code: 'GP',
        name: 'Guadeloupe',
        number: '590'
    },
    {
        code: 'GU',
        name: 'Guam',
        number: '1'
    },
    {
        code: 'GT',
        name: 'Guatemala',
        number: '502'
    },
    {
        code: 'GG',
        name: 'Guernsey',
        number: '44'
    },
    {
        code: 'GN',
        name: 'Guinea Conakry',
        number: '224'
    },
    {
        code: 'GW',
        name: 'Guinea-Bissau',
        number: '245'
    },
    {
        code: 'GY',
        name: 'Guyana',
        number: '592'
    },
    {
        code: 'HT',
        name: 'Haiti',
        number: '509'
    },
    {
        code: 'HM',
        name: 'Heard Island and McDonald Islands',
        number: '672'
    },
    {
        code: 'HN',
        name: 'Honduras',
        number: '504'
    },
    {
        code: 'HK',
        name: 'Hong Kong',
        number: '852'
    },
    {
        code: 'HU',
        name: 'Hungary',
        number: '36'
    },
    {
        code: 'IS',
        name: 'Iceland',
        number: '354'
    },
    {
        code: 'IN',
        name: 'India',
        number: '91'
    },
    {
        code: 'ID',
        name: 'Indonesia',
        number: '62'
    },
    {
        code: 'IR',
        name: 'Iran',
        number: '98'
    },
    {
        code: 'IQ',
        name: 'Iraq',
        number: '964'
    },
    {
        code: 'IE',
        name: 'Ireland',
        number: '353'
    },
    {
        code: 'IM',
        name: 'Isle of Man',
        number: '44'
    },
    {
        code: 'IL',
        name: 'Israel',
        number: '972'
    },
    {
        code: 'IT',
        name: 'Italy',
        number: '39'
    },
    {
        code: 'JM',
        name: 'Jamaica',
        number: '1'
    },
    {
        code: 'JP',
        name: 'Japan',
        number: '81'
    },
    {
        code: 'JE',
        name: 'Jersey',
        number: '44'
    },
    {
        code: 'JO',
        name: 'Jordan',
        number: '962'
    },
    {
        code: 'KZ',
        name: 'Kazakhstan',
        number: '7'
    },
    {
        code: 'KE',
        name: 'Kenya',
        number: '254'
    },
    {
        code: 'KI',
        name: 'Kiribati',
        number: '686'
    },
    {
        code: 'KW',
        name: 'Kuwait',
        number: '965'
    },
    {
        code: 'KG',
        name: 'Kyrgyzstan',
        number: '996'
    },
    {
        code: 'LA',
        name: 'Laos',
        number: '856'
    },
    {
        code: 'LV',
        name: 'Latvia',
        number: '371'
    },
    {
        code: 'LB',
        name: 'Lebanon',
        number: '961'
    },
    {
        code: 'LS',
        name: 'Lesotho',
        number: '266'
    },
    {
        code: 'LR',
        name: 'Liberia',
        number: '231'
    },
    {
        code: 'LY',
        name: 'Libya',
        number: '218'
    },
    {
        code: 'LI',
        name: 'Liechtenstein',
        number: '423'
    },
    {
        code: 'LT',
        name: 'Lithuania',
        number: '370'
    },
    {
        code: 'LU',
        name: 'Luxembourg',
        number: '352'
    },
    {
        code: 'MO',
        name: 'Macau',
        number: '853'
    },
    {
        code: 'MK',
        name: 'Macedonia',
        number: '389'
    },
    {
        code: 'MG',
        name: 'Madagascar',
        number: '261'
    },
    {
        code: 'MW',
        name: 'Malawi',
        number: '265'
    },
    {
        code: 'MY',
        name: 'Malaysia',
        number: '60'
    },
    {
        code: 'MV',
        name: 'Maldives',
        number: '960'
    },
    {
        code: 'ML',
        name: 'Mali',
        number: '223'
    },
    {
        code: 'MT',
        name: 'Malta',
        number: '356'
    },
    {
        code: 'MH',
        name: 'Marshall Islands',
        number: '692'
    },
    {
        code: 'MQ',
        name: 'Martinique',
        number: '596'
    },
    {
        code: 'MR',
        name: 'Mauritania',
        number: '222'
    },
    {
        code: 'MU',
        name: 'Mauritius',
        number: '230'
    },
    {
        code: 'YT',
        name: 'Mayotte',
        number: '262'
    },
    {
        code: 'MX',
        name: 'Mexico',
        number: '52'
    },
    {
        code: 'FM',
        name: 'Micronesia',
        number: '691'
    },
    {
        code: 'MD',
        name: 'Moldova',
        number: '373'
    },
    {
        code: 'MC',
        name: 'Monaco',
        number: '377'
    },
    {
        code: 'MN',
        name: 'Mongolia',
        number: '976'
    },
    {
        code: 'ME',
        name: 'Montenegro',
        number: '382'
    },
    {
        code: 'MS',
        name: 'Montserrat',
        number: '1'
    },
    {
        code: 'MA',
        name: 'Morocco',
        number: '212'
    },
    {
        code: 'MZ',
        name: 'Mozambique',
        number: '258'
    },
    {
        code: 'MM',
        name: 'Myanmar (Burma)',
        number: '95'
    },
    {
        code: 'NA',
        name: 'Namibia',
        number: '264'
    },
    {
        code: 'NR',
        name: 'Nauru',
        number: '674'
    },
    {
        code: 'NP',
        name: 'Nepal',
        number: '977'
    },
    {
        code: 'NL',
        name: 'Netherlands',
        number: '31'
    },
    {
        code: 'NC',
        name: 'New Caledonia',
        number: '687'
    },
    {
        code: 'NZ',
        name: 'New Zealand',
        number: '64'
    },
    {
        code: 'NI',
        name: 'Nicaragua',
        number: '505'
    },
    {
        code: 'NE',
        name: 'Niger',
        number: '227'
    },
    {
        code: 'NG',
        name: 'Nigeria',
        number: '234'
    },
    {
        code: 'NU',
        name: 'Niue',
        number: '683'
    },
    {
        code: 'NF',
        name: 'Norfolk Island',
        number: '672'
    },
    {
        code: 'KP',
        name: 'North Korea',
        number: '850'
    },
    {
        code: 'MP',
        name: 'Northern Mariana Islands',
        number: '1'
    },
    {
        code: 'NO',
        name: 'Norway',
        number: '47'
    },
    {
        code: 'OM',
        name: 'Oman',
        number: '968'
    },
    {
        code: 'PK',
        name: 'Pakistan',
        number: '92'
    },
    {
        code: 'PW',
        name: 'Palau',
        number: '680'
    },
    {
        code: 'PS',
        name: 'Palestinian Territories',
        number: '970'
    },
    {
        code: 'PA',
        name: 'Panama',
        number: '507'
    },
    {
        code: 'PG',
        name: 'Papua New Guinea',
        number: '675'
    },
    {
        code: 'PY',
        name: 'Paraguay',
        number: '595'
    },
    {
        code: 'PE',
        name: 'Peru',
        number: '51'
    },
    {
        code: 'PH',
        name: 'Philippines',
        number: '63'
    },
    {
        code: 'PL',
        name: 'Poland',
        number: '48'
    },
    {
        code: 'PT',
        name: 'Portugal',
        number: '351'
    },
    {
        code: 'PR',
        name: 'Puerto Rico',
        number: '1'
    },
    {
        code: 'QA',
        name: 'Qatar',
        number: '974'
    },
    {
        code: 'RE',
        name: 'Réunion',
        number: '262'
    },
    {
        code: 'RO',
        name: 'Romania',
        number: '40'
    },
    {
        code: 'RU',
        name: 'Russia',
        number: '7'
    },
    {
        code: 'RW',
        name: 'Rwanda',
        number: '250'
    },
    {
        code: 'BL',
        name: 'Saint Barthélemy',
        number: '590'
    },
    {
        code: 'SH',
        name: 'Saint Helena',
        number: '290'
    },
    {
        code: 'KN',
        name: 'St. Kitts',
        number: '1'
    },
    {
        code: 'LC',
        name: 'St. Lucia',
        number: '1'
    },
    {
        code: 'MF',
        name: 'Saint Martin',
        number: '590'
    },
    {
        code: 'PM',
        name: 'Saint Pierre and Miquelon',
        number: '508'
    },
    {
        code: 'VC',
        name: 'St. Vincent',
        number: '1'
    },
    {
        code: 'WS',
        name: 'Samoa',
        number: '685'
    },
    {
        code: 'SM',
        name: 'San Marino',
        number: '378'
    },
    {
        code: 'ST',
        name: 'São Tomé and Príncipe',
        number: '239'
    },
    {
        code: 'SA',
        name: 'Saudi Arabia',
        number: '966'
    },
    {
        code: 'SN',
        name: 'Senegal',
        number: '221'
    },
    {
        code: 'RS',
        name: 'Serbia',
        number: '381'
    },
    {
        code: 'SC',
        name: 'Seychelles',
        number: '248'
    },
    {
        code: 'SL',
        name: 'Sierra Leone',
        number: '232'
    },
    {
        code: 'SG',
        name: 'Singapore',
        number: '65'
    },
    {
        code: 'SX',
        name: 'Sint Maarten',
        number: '1'
    },
    {
        code: 'SK',
        name: 'Slovakia',
        number: '421'
    },
    {
        code: 'SI',
        name: 'Slovenia',
        number: '386'
    },
    {
        code: 'SB',
        name: 'Solomon Islands',
        number: '677'
    },
    {
        code: 'SO',
        name: 'Somalia',
        number: '252'
    },
    {
        code: 'ZA',
        name: 'South Africa',
        number: '27'
    },
    {
        code: 'GS',
        name: 'South Georgia and the South Sandwich Islands',
        number: '500'
    },
    {
        code: 'KR',
        name: 'South Korea',
        number: '82'
    },
    {
        code: 'SS',
        name: 'South Sudan',
        number: '211'
    },
    {
        code: 'ES',
        name: 'Spain',
        number: '34'
    },
    {
        code: 'LK',
        name: 'Sri Lanka',
        number: '94'
    },
    {
        code: 'SD',
        name: 'Sudan',
        number: '249'
    },
    {
        code: 'SR',
        name: 'Suriname',
        number: '597'
    },
    {
        code: 'SJ',
        name: 'Svalbard and Jan Mayen',
        number: '47'
    },
    {
        code: 'SZ',
        name: 'Swaziland',
        number: '268'
    },
    {
        code: 'SE',
        name: 'Sweden',
        number: '46'
    },
    {
        code: 'CH',
        name: 'Switzerland',
        number: '41'
    },
    {
        code: 'SY',
        name: 'Syria',
        number: '963'
    },
    {
        code: 'TW',
        name: 'Taiwan',
        number: '886'
    },
    {
        code: 'TJ',
        name: 'Tajikistan',
        number: '992'
    },
    {
        code: 'TZ',
        name: 'Tanzania',
        number: '255'
    },
    {
        code: 'TH',
        name: 'Thailand',
        number: '66'
    },
    {
        code: 'TG',
        name: 'Togo',
        number: '228'
    },
    {
        code: 'TK',
        name: 'Tokelau',
        number: '690'
    },
    {
        code: 'TO',
        name: 'Tonga',
        number: '676'
    },
    {
        code: 'TT',
        name: 'Trinidad/Tobago',
        number: '1'
    },
    {
        code: 'TN',
        name: 'Tunisia',
        number: '216'
    },
    {
        code: 'TR',
        name: 'Turkey',
        number: '90'
    },
    {
        code: 'TM',
        name: 'Turkmenistan',
        number: '993'
    },
    {
        code: 'TC',
        name: 'Turks and Caicos Islands',
        number: '1'
    },
    {
        code: 'TV',
        name: 'Tuvalu',
        number: '688'
    },
    {
        code: 'VI',
        name: 'U.S. Virgin Islands',
        number: '1'
    },
    {
        code: 'UG',
        name: 'Uganda',
        number: '256'
    },
    {
        code: 'UA',
        name: 'Ukraine',
        number: '380'
    },
    {
        code: 'AE',
        name: 'United Arab Emirates',
        number: '971'
    },
    {
        code: 'GB',
        name: 'United Kingdom',
        number: '44'
    },
    {
        code: 'UY',
        name: 'Uruguay',
        number: '598'
    },
    {
        code: 'UZ',
        name: 'Uzbekistan',
        number: '998'
    },
    {
        code: 'VU',
        name: 'Vanuatu',
        number: '678'
    },
    {
        code: 'VA',
        name: 'Vatican City',
        number: '379'
    },
    {
        code: 'VE',
        name: 'Venezuela',
        number: '58'
    },
    {
        code: 'VN',
        name: 'Vietnam',
        number: '84'
    },
    {
        code: 'WF',
        name: 'Wallis and Futuna',
        number: '681'
    },
    {
        code: 'EH',
        name: 'Western Sahara',
        number: '212'
    },
    {
        code: 'YE',
        name: 'Yemen',
        number: '967'
    },
    {
        code: 'ZM',
        name: 'Zambia',
        number: '260'
    },
    {
        code: 'ZW',
        name: 'Zimbabwe',
        number: '263'
    }
];

/**
 * Searches through all country code infos for one that has a matching code.
 *
 * @param {string} code - The country code to search for.
 * @private
 * @returns {Object}
 */
export function findCountryInfoByCode(code) {
    return countriesInfo.find(info => info.code === code);
}

export default countriesInfo;
