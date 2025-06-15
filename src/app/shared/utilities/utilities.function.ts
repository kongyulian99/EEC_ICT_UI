export function isNotEmpty(value: any): boolean {
    if (value !== null && typeof value === 'object') {
        for (const prop in value) {
            if (value.hasOwnProperty(prop)) {
                return true;
            }
        }

        return JSON.stringify(value) !== JSON.stringify({});
    } else {
        return value !== undefined && value !== null && value !== '';
    }
}
export function slugify(str: string, separator?: string) {
    str = str
        .toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
        .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, '-')
        .replace(/,+/g, '-')
        .replace(/&+/g, '-')
        .replace(/=+/g, '-')
        // .replace(/[^A-Za-z0-9_-]/g, '')
        .replace(/-+/g, '-');
    return separator ? str.replace(/-/g, separator) : str;
}
export function removeSeparator(str: string, separator?: string) {
    return separator ? str.replace(/-/g, separator) : str;
}
export function isNameNotExist(
    newName: string,
    oldName: string,
    listData: any[],
    fieldName: string
): boolean {
    let tmp: any;
    tmp = listData.find(o => o[fieldName] == newName && o[fieldName] != oldName);
    if (tmp) {
        return false;
    }
    return true;
}

export function isSameTwoArray(arr1: any[], arr2: any[]) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

export function fixTimezoneToJSON(date: any) {
    let tempDate: any;
    if (date instanceof Date) {
        tempDate = date;
    } else {
        tempDate = new Date(date);
    }
    return (new Date(tempDate.getTime() - (tempDate.getTimezoneOffset() * 60000))).toJSON();
}


export function clone(obj: any) {
    // Handle the 3 simple types, and null or undefined
    return JSON.parse(JSON.stringify(obj));
}

export function removeVietnameseTones(str: string) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "a");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "e");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "i");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "o");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "u");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "y");
    str = str.replace(/Đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g," ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    return str;
}
export function makeRandomCharaters(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}


export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}



export function getDateFromStringDDYYMMMM(dateString: any) {
    let result: Date;
    if (dateString instanceof Date) {
        result = dateString;
    }
    if (dateString.length > 0) {
        dateString = dateString.trim();
        let dateParts = dateString.split('/');
        /** case mm/dd/yyyy */
        if (parseInt(dateParts[1], 10) > 12) {
            result = new Date(parseInt(dateParts[2], 10), (parseInt(dateParts[0], 10) - 1), parseInt(dateParts[1], 10))
        } else {
            /** case dd/mm/yyyy */
            result = new Date(parseInt(dateParts[2], 10), (parseInt(dateParts[1], 10) - 1), parseInt(dateParts[0], 10))
        }
    }

    if (result.getFullYear() > 1945) {
        return result;
    }


    return new Date(1945);
}

export function getNumberFromCell(num: any) {
    if (typeof num == 'number') { return num; }
    return parseFloat(num.trim());
}

export function roundNumber(num: number) {
    if (num < 0) {
        return Math.ceil(num);
    }

    return Math.floor(num);
}


export function validateNgayThang(ngay) {
    if (ngay instanceof Date) {
        if (ngay.getFullYear() < 1971) {
            return { Ok: false, message: 'Giá trị cột ngày tháng năm phải đúng định dạng ví dụ: 01/12/2020' };
        }

        return { Ok: true, message: '' };
    }
    if (ngay.length == 0) {
        return { Ok: true, message: '' };
    }
    try {
        var dateParts = ngay.trim().split('/');
        if (dateParts.length != 3) {
            throw Error("Unable to parse date");
        }


        // get date string part
        var ngayPart = parseInt(dateParts[0], 10)
        var monthPart = parseInt(dateParts[1], 10)
        var yearPart = parseInt(dateParts[2], 10)

        /** is number ngay, thang, nam */
        if (isNaN(ngayPart) || isNaN(monthPart) || isNaN(yearPart)) {
            throw Error("Unable to parse date");
        }

        /**
         * case mm/yy/dddd
         */
        if (monthPart > 12) {
            monthPart = parseInt(dateParts[0], 10);
            ngayPart = parseInt(dateParts[1], 10);
        }


        if (ngayPart < 0 || ngayPart > 31) {
            throw Error("Unable to parse date");
        }

        if (monthPart < 0 || monthPart > 12) {
            throw Error("Unable to parse date");
        }


        if (yearPart < 1945 || yearPart > 2100) {
            throw Error("Unable to parse date");
        }


        let date = new Date(parseInt(dateParts[2], 10), (parseInt(dateParts[1], 10) - 1), parseInt(dateParts[0], 10));

        if (date.getDate() == ngayPart && date.getMonth() == (monthPart - 1) && date.getFullYear() == yearPart) {
            return { Ok: true, message: '' };
        } else {
            throw Error("Unable to parse date");
        }


    } catch (err) {
        return { Ok: false, message: 'Giá trị cột ngày tháng năm phải đúng định dạng ví dụ: 01/12/2020' };
    }
}

export function validateNumber(num, largerThanZero = false) {
    if (typeof num == 'number') {
        // if (num > 2147483640) {
        //     throw Error("Unable to parse int");
        // }
        if (largerThanZero && num < 0) {
            return { Ok: false, message: 'Giá trị phải lớn hơn 0' };
        }
        return { Ok: true, message: '' };
    }
    if (num.length == 0) {
        return { Ok: true, message: '' };
    }
    try {
        if (!isNaN(num.trim()) && !isNaN(parseFloat(num.trim()))) {
            // if (parseFloat(num.trim()) > 2147483640) {
            //     throw Error("Unable to parse int");
            // }

            if (largerThanZero && parseFloat(num.trim()) < 0) {
                throw Error("Giá trị phải lớn hơn 0");
            }
            return { Ok: true, message: '' };
        } else {
            throw Error("Unable to parse int");
        }
    } catch (err) {
        return { Ok: false, message: 'Giá trị phải đúng định dạng số' };
    }
}


export function validationPasswordSpecialCharacter (str) {
    // min 8 letter password, with at least a symbol, upper and lower case letters and a number
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
}