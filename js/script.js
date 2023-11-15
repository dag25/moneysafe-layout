import { convertStringNumber } from './convertStringNumber.js';
import { OverlayScrollbars } from './overlayscrollbars.esm.js';

const API_URL = 'https://pale-zircon-nightingale.glitch.me/api';

const typesOperation = {
	income: 'доход',
	expenses: 'расход',
};

const financeForm = document.querySelector('.finance__form');
const financeAmount = document.querySelector('.finance__amount');
const financeReport = document.querySelector('.finance__report');
const report = document.querySelector('.report');
const reportOperationList = document.querySelector('.report__operation-list');
const reportDates = document.querySelector('.report__dates');

let amount = 0;

financeAmount.textContent = amount;

financeForm.addEventListener('submit', event => {
	event.preventDefault();
	const typeOperation = event.submitter.dataset.typeOperation;
	const changeAmount = Math.abs(convertStringNumber(financeForm.amount.value));

	if (typeOperation === 'income') {
		amount = amount + changeAmount;
	}

	if (typeOperation === 'expenses') {
		amount = amount - changeAmount;
	}

	financeAmount.textContent = `${amount.toLocaleString()} ₽`;
});
OverlayScrollbars(report, {});

const getData = async url => {
	try {
		const response = await fetch(`${API_URL}${url}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Ошибка при получении данных:', error);
		throw error;
	}
};

const closeReport = ({ target }) => {
	if (
		target.closest('.report__close') ||
		(!target.closest('.report') && target !== financeReport)
	) {
		gsap.to(report, {
			opacity: 0,
			scale: 0,
			duration: 0.5,
			eases: 'power2.in',
			onComplete() {
				report.style.visibility = 'hidden';
			},
		});

		document.removeEventListener('click', closeReport);
	}
};

const openReport = e => {
	report.style.visibility = 'visible';
	gsap.to(report, {
		opacity: 1,
		scale: 1,
		duration: 0.5,
		eases: 'power2.out',
	});
	document.addEventListener('click', closeReport);
};

const reformatDate = dateStr => {
	const [year, month, day] = dateStr.split('-');
	return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
};

const renderReport = data => {
	reportOperationList.textContent = '';

	const reportRows = data.map(({ category, amount, description, date, type }) => {
		const reportRow = document.createElement('tr');
		reportRow.classList.add('report__row');
		reportRow.innerHTML = `
			<td class="report__cell">${category}</td>
			<td class="report__cell">${amount.toLocaleString()}&nbsp;₽</td>
			<td class="report__cell">${description}</td>
			<td class="report__cell">${reformatDate(date)}</td>
			<td class="report__cell">${typesOperation[type]}</td>
			<td class="report__action-cell">
				<button class="report__button report__button_table">&#10006;</button>
			</td>
		`;
		return reportRow;
	});
	reportOperationList.append(...reportRows);
};

financeReport.addEventListener('click', async () => {
	const textContent = financeReport.textContent;
	financeReport.textContent = 'Загрузка';
	financeReport.disabled = true;
	const data = await getData('/test');
	financeReport.textContent = textContent;
	financeReport.disabled = false;
	renderReport(data);
	openReport();
});

reportDates.addEventListener('submit', async e => {
	e.preventDefault();

	const formData = Object.fromEntries(new FormData(reportDates));

	const searchParams = new URLSearchParams();
	console.log(formData);
	if (formData.startDate) {
		searchParams.append('startDate', formData.startDate);
	}
	if (formData.endDate) {
		searchParams.append('endDate', formData.endDate);
	}
	console.log(searchParams);
	const queryString = searchParams.toString();
	console.log(queryString);
	const url = queryString ? `/test?${queryString}` : '/test';

	const data = await getData(url);

	renderReport(data);
});
