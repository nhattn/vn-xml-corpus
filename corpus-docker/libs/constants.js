'use strict';

exports.TOOLKITS = [
    {
        name:"sent",
        alias:"SE",
        fullname:"Tách câu",
        alltags:[
            {
                name:"Bắt đầu câu",
                cmd:"BOS"
            },
            {
                name:"Kết thúc câu",
                cmd:"EOS"
            }
        ]
    },
    {
        name:"word",
        alias:"WS",
        fullname:"Tách từ",
        alltags:[
            {
                name:"Bắt đầu",
                cmd:"B-W"
            },
            {
                name:"Từ tiếp theo",
                cmd:"I-W"
            },
        ]
    },
    {
        name:"pos",
        alias:"PS",
        fullname:"Gắn nhãn",
        alltags:[
            {
                name:"Danh từ",
                cmd:"N"
            },
            {
                name:"Động từ",
                cmd:"V"
            },
            {
                name:"Phó từ",
                cmd:"R"
            },
            {
                name:"Số từ",
                cmd:"M"
            },
            {
                name:"Ký tự",
                cmd:"CH"
            },
            {
                name:"Liên từ",
                cmd:"C"
            },
            {
                name:"Tính từ",
                cmd:"A"
            },
            {
                name:"Giới từ",
                cmd:"E"
            },
            {
                name:"Đại từ",
                cmd:"P"
            },
            {
                name:"Danh từ đơn vị",
                cmd:"Nu"
            },
            {
                name:"Danh từ chỉ loại",
                cmd:"Nc"
            },
            {
                name:"Định từ",
                cmd:"L"
            },
            {
                name:"Liên từ đẳng lập",
                cmd:"Cc"
            },
            {
                name:"Không phân loại",
                cmd:"X"
            },
            {
                name:"Danh từ riêng",
                cmd:"Np"
            },
            {
                name:"Trợ từ",
                cmd:"T"
            },
            {
                name:"Danh từ viết tắt",
                cmd:"Ny"
            },
            {
                name:"Danh từ ký hiệu",
                cmd:"Ni"
            },
            {
                name:"Nb",
                cmd:"Nb"
            },
            {
                name:"Viết tắt",
                cmd:"Y"
            },
            {
                name:"Động từ mượn",
                cmd:"Vb"
            },
            {
                name:"Thán từ",
                cmd:"I"
            },
            {
                name:"Yếu tố cấu tạo",
                cmd:"Z"
            },
            {
                name:"Từ mượn",
                cmd:"B"
            },
            {
                name:"Giới từ mượn",
                cmd:"Eb"
            },
            {
                name:"Động từ mượn",
                cmd:"Vy"
            },
            {
                name:"Tính từ mượn",
                cmd:"Ab"
            },
            {
                name:"Từ mượn không phân loại",
                cmd:"Xy"
            },
            {
                name:"Liên từ mượn",
                cmd:"Cb"
            },
            {
                name:"Số từ mượn",
                cmd:"Mb"
            },
            {
                name:"Đại từ mượn",
                cmd:"Pb"
            }
        ]
    },
    {
        name:"chunk",
        alias:"CK",
        fullname:"Nhóm từ",
        alltags:[
            {
                name:"Bắt đầu danh từ",
                cmd:"B-NP"
            },
            {
                name:"Danh từ tiếp theo",
                cmd:"I-NP"
            },
            {
                name:"Bắt đầu động từ",
                cmd:"B-VP"
            },
            {
                name:"Động từ tiếp theo",
                cmd:"I-VP"
            },
            {
                name:"Bắt đầu tính từ",
                cmd:"B-AP"
            },
            {
                name:"Tính từ tiếp theo",
                cmd:"I-AP"
            },
            {
                name:"Bắt đầu đại từ",
                cmd:"B-PP"
            },
            {
                name:"Đại từ tiếp theo",
                cmd:"I-PP"
            }
        ]
    },
    {
        name:"ner",
        alias:"NER",
        fullname:"Thực thể",
        alltags:[
            {
                name:"Bắt đầu địa điểm",
                cmd:"B-LOC"
            },
            {
                name:"Tiếp tục Địa điểm",
                cmd:"I-LOC"
            },
            {
                name:"Bắt đầu một tổ chức",
                cmd:"B-ORG"
            },
            {
                name:"Tiếp tục tên tổ chức",
                cmd:"I-ORG"
            },
            {
                name:"Bắt đầu tên người",
                cmd:"B-PER"
            },
            {
                name:"Tiếp tục tên người",
                cmd:"I-PER"
            },
            {
                name:"Bắt đầu",
                cmd:"B-MISC"
            },
            {
                name:"Tiếp tục",
                cmd:"I-MISC"
            }
        ]
    },
    {
        name:"sner",
        alias:"CHILD",
        fullname:"Thực thể con",
        alltags:[
           {
                name:"Bắt đầu địa điểm",
                cmd:"B-LOC"
            },
            {
                name:"Tiếp tục Địa điểm",
                cmd:"I-LOC"
            },
            {
                name:"Bắt đầu một tổ chức",
                cmd:"B-ORG"
            },
            {
                name:"Tiếp tục tên tổ chức",
                cmd:"I-ORG"
            },
            {
                name:"Bắt đầu tên người",
                cmd:"B-PER"
            },
            {
                name:"Tiếp tục tên người",
                cmd:"I-PER"
            }
        ]
    }
];
